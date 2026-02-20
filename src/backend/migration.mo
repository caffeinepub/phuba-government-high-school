import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldStudent = {
    id : Text;
    name : Text;
    className : Text;
  };

  type OldUserProfile = {
    name : Text;
    role : Text;
  };

  type Actor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    students : Map.Map<Text, OldStudent>;
  };

  type NewStudent = {
    id : Text;
    name : Text;
    className : Text;
    photo : Storage.ExternalBlob;
  };

  type NewUserProfile = {
    name : Text;
    role : Text;
    photo : Storage.ExternalBlob;
    studentId : ?Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    students : Map.Map<Text, NewStudent>;
  };

  public func run(old : Actor) : NewActor {
    let newStudents = old.students.map<Text, OldStudent, NewStudent>(
      func(_id, oldStudent) {
        { oldStudent with photo = Blob.fromArray([]) };
      }
    );
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_id, oldUserProfile) {
        {
          oldUserProfile with
          photo = Blob.fromArray([]);
          studentId = null;
        };
      }
    );
    {
      userProfiles = newUserProfiles;
      students = newStudents;
    };
  };
};
