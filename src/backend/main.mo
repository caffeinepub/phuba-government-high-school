import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Authorization "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize the user system state
  let accessControlState = Authorization.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type UserProfile = {
    name : Text;
    photo : Storage.ExternalBlob;
    studentId : ?Text;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  let poems = Map.empty<Nat, Poem>();
  var nextPoemId = 0;

  public type Poem = {
    id : Nat;
    title : Text;
    author : Text;
    poemText : Text;
    dateWritten : Text;
    category : Text;
    englishTranslation : ?Text;
    culturalContext : ?Text;
    createdBy : Principal;
    timestamp : Int;
  };

  module Poem {
    public func compareById(p1 : Poem, p2 : Poem) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  public shared ({ caller }) func createPoem(
    title : Text,
    author : Text,
    poemText : Text,
    dateWritten : Text,
    category : Text,
    englishTranslation : ?Text,
    culturalContext : ?Text,
  ) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create poems");
    };
    let poem : Poem = {
      id = nextPoemId;
      title;
      author;
      poemText;
      dateWritten;
      category;
      englishTranslation;
      culturalContext;
      createdBy = caller;
      timestamp = Time.now();
    };
    poems.add(nextPoemId, poem);
    nextPoemId += 1;
  };

  public shared ({ caller }) func updatePoem(
    id : Nat,
    title : Text,
    author : Text,
    poemText : Text,
    dateWritten : Text,
    category : Text,
    englishTranslation : ?Text,
    culturalContext : ?Text,
  ) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update poems");
    };
    let poem = switch (poems.get(id)) {
      case (?p) { p };
      case (null) { Runtime.trap("Poem not found") };
    };
    let updatedPoem : Poem = {
      id;
      title;
      author;
      poemText;
      dateWritten;
      category;
      englishTranslation;
      culturalContext;
      createdBy = poem.createdBy;
      timestamp = Time.now();
    };
    poems.add(id, updatedPoem);
  };

  public shared ({ caller }) func deletePoem(id : Nat) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete poems");
    };
    poems.remove(id);
  };

  public query ({ caller }) func getPoem(id : Nat) : async ?Poem {
    poems.get(id);
  };

  public query ({ caller }) func listPoems() : async [Poem] {
    poems.values().toArray().sort(Poem.compareById);
  };

  public query ({ caller }) func listPoemsByCategory(category : Text) : async [Poem] {
    let iter = poems.entries();
    iter
      .toArray()
      .map(func((_, poem)) { poem })
      .filter(func(p) { Text.equal(p.category, category) });
  };
};
