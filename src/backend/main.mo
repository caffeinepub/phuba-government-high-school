import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type Student = {
    id : Text;
    name : Text;
    className : Text;
  };

  module Student {
    public func compare(student1 : Student, student2 : Student) : Order.Order {
      switch (Text.compare(student1.className, student2.className)) {
        case (#equal) { Text.compare(student1.name, student2.name) };
        case (order) { order };
      };
    };

    public func compareByName(student1 : Student, student2 : Student) : Order.Order {
      Text.compare(student1.name, student2.name);
    };

    public func compareById(student1 : Student, student2 : Student) : Order.Order {
      Text.compare(student1.id, student2.id);
    };

    public func compareByClass(student1 : Student, student2 : Student) : Order.Order {
      Text.compare(student1.className, student2.className);
    };
  };

  let students = Map.empty<Text, Student>();

  public shared ({ caller }) func addStudent(student : Student) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    students.add(student.id, student);
  };

  public shared ({ caller }) func removeStudent(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove students");
    };
    students.remove(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    students.values().toArray().sort();
  };

  public query ({ caller }) func getStudentsByClass(className : Text) : async [Student] {
    students.values().toArray().filter(
      func(student) {
        Text.equal(student.className, className);
      }
    ).sort();
  };

  public query ({ caller }) func getStudentsByName() : async [Student] {
    students.values().toArray().sort(Student.compareByName);
  };

  public query ({ caller }) func getStudentsById() : async [Student] {
    students.values().toArray().sort(Student.compareById);
  };

  public type Announcement = {
    id : Nat;
    title : Text;
    content : Text;
    timestamp : Time.Time;
  };

  module Announcement {
    public func compareByTimestamp(announcement1 : Announcement, announcement2 : Announcement) : Order.Order {
      Int.compare(announcement2.timestamp, announcement1.timestamp);
    };
  };

  let announcements = Map.empty<Nat, Announcement>();
  var nextAnnouncementId = 0;

  public shared ({ caller }) func addAnnouncement(title : Text, content : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add announcements");
    };
    let announcement : Announcement = {
      id = nextAnnouncementId;
      title;
      content;
      timestamp = Time.now();
    };
    announcements.add(nextAnnouncementId, announcement);
    nextAnnouncementId += 1;
  };

  public shared ({ caller }) func removeAnnouncement(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove announcements");
    };
    announcements.remove(id);
  };

  public query ({ caller }) func getAllAnnouncements() : async [Announcement] {
    announcements.values().toArray().sort(Announcement.compareByTimestamp);
  };

  public type ClassSchedule = {
    grade : Text;
    section : Text;
    schedule : [Text];
  };

  module ClassSchedule {
    public func compare(schedule1 : ClassSchedule, schedule2 : ClassSchedule) : Order.Order {
      switch (Text.compare(schedule1.grade, schedule2.grade)) {
        case (#equal) { Text.compare(schedule1.section, schedule2.section) };
        case (order) { order };
      };
    };
  };

  let classSchedules = Map.empty<Text, ClassSchedule>();

  public shared ({ caller }) func addClassSchedule(section : Text, grade : Text, schedule : [Text]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add class schedules");
    };
    let classSchedule : ClassSchedule = {
      grade;
      section;
      schedule;
    };
    classSchedules.add(section, classSchedule);
  };

  public shared ({ caller }) func removeClassSchedule(section : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove class schedules");
    };
    classSchedules.remove(section);
  };

  public query ({ caller }) func getAllClassSchedules() : async [ClassSchedule] {
    classSchedules.values().toArray();
  };

  public query ({ caller }) func getClassSchedulesByGrade(grade : Text) : async [ClassSchedule] {
    classSchedules.values().toArray().filter(
      func(schedule) {
        Text.equal(schedule.grade, grade);
      }
    );
  };

  public type Event = {
    id : Nat;
    title : Text;
    description : Text;
    date : Time.Time;
  };

  module Event {
    public func compareByDate(event1 : Event, event2 : Event) : Order.Order {
      Int.compare(event1.date, event2.date);
    };
  };

  let events = Map.empty<Nat, Event>();
  var nextEventId = 0;

  public shared ({ caller }) func addEvent(title : Text, description : Text, date : Time.Time) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add events");
    };
    let event : Event = {
      id = nextEventId;
      title;
      description;
      date;
    };
    events.add(nextEventId, event);
    nextEventId += 1;
  };

  public shared ({ caller }) func removeEvent(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove events");
    };
    events.remove(id);
  };

  public query ({ caller }) func getAllEvents() : async [Event] {
    events.values().toArray().sort(Event.compareByDate);
  };
};
