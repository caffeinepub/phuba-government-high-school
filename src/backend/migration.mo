import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";

module {
  type OldUserProfile = {
    name : Text;
    role : Text;
    photo : Storage.ExternalBlob;
    studentId : ?Text;
  };

  type Student = {
    id : Text;
    name : Text;
    className : Text;
    photo : Storage.ExternalBlob;
  };

  type TeacherProfile = {
    id : Text;
    name : Text;
    subjects : [Text];
    qualifications : Text;
    contactInfo : Text;
    photo : Storage.ExternalBlob;
    officeHours : Text;
  };

  type Announcement = {
    id : Nat;
    title : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type ExamResult = {
    studentId : Text;
    examName : Text;
    subject : Text;
    grade : Text;
    percentage : Nat;
    examDate : Time.Time;
    remarks : Text;
  };

  type ClassSchedule = {
    grade : Text;
    section : Text;
    schedule : [Text];
  };

  type Event = {
    id : Nat;
    title : Text;
    description : Text;
    date : Time.Time;
  };

  type PhotoCategory = { #general; #events; #achievements; #facilities };

  type PhotoRecord = {
    id : Nat;
    title : Text;
    description : Text;
    category : PhotoCategory;
    image : Storage.ExternalBlob;
    uploadedBy : Text;
    timestamp : Time.Time;
  };

  type Book = {
    id : Nat;
    title : Text;
    author : Text;
    isbn : Text;
    category : Text;
    availableCopies : Nat;
    thumbnail : Storage.ExternalBlob;
    totalCopies : Nat;
  };

  type BorrowStatus = { #borrowed; #returned; #overdue };

  type BorrowingRecord = {
    id : Nat;
    bookId : Nat;
    studentId : Text;
    borrowDate : Time.Time;
    dueDate : Time.Time;
    returnDate : ?Time.Time;
    status : BorrowStatus;
  };

  type FeeStatus = { #pending; #partial; #paid; #overdue };

  type FeeRecord = {
    id : Nat;
    studentId : Text;
    feeType : Text;
    amount : Nat;
    dueDate : Time.Time;
    paidAmount : Nat;
    paidDate : ?Time.Time;
    status : FeeStatus;
    description : Text;
  };

  type PaymentTransaction = {
    id : Nat;
    feeId : Nat;
    studentId : Text;
    amount : Nat;
    paymentDate : Time.Time;
    paymentMethod : Text;
    transactionId : Text;
  };

  type ContactForm = {
    id : Nat;
    senderName : Text;
    senderEmail : Text;
    subject : Text;
    message : Text;
    timestamp : Time.Time;
    status : ContactStatus;
    studentId : ?Text;
  };

  type ContactStatus = { #new; #read; #replied };

  type OldActor = {
    announcements : Map.Map<Nat, Announcement>;
    books : Map.Map<Nat, Book>;
    borrowingRecords : Map.Map<Nat, BorrowingRecord>;
    classSchedules : Map.Map<Text, ClassSchedule>;
    contactForms : Map.Map<Nat, ContactForm>;
    events : Map.Map<Nat, Event>;
    examResults : Map.Map<Text, [ExamResult]>;
    feeRecords : Map.Map<Nat, FeeRecord>;
    nextAnnouncementId : Nat;
    nextBookId : Nat;
    nextBorrowingId : Nat;
    nextContactFormId : Nat;
    nextEventId : Nat;
    nextFeeId : Nat;
    nextPaymentId : Nat;
    nextPhotoId : Nat;
    paymentTransactions : Map.Map<Nat, PaymentTransaction>;
    photoRecords : Map.Map<Nat, PhotoRecord>;
    students : Map.Map<Text, Student>;
    teacherProfiles : Map.Map<Text, TeacherProfile>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    name : Text;
    photo : Storage.ExternalBlob;
    studentId : ?Text;
  };

  type Poem = {
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

  type NewActor = {
    nextPoemId : Nat;
    poems : Map.Map<Nat, Poem>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    // Old system is deleted and not migrated
    {
      userProfiles = old.userProfiles.map(
        func(_p, oldProfile) {
          {
            name = oldProfile.name;
            photo = oldProfile.photo;
            studentId = oldProfile.studentId;
          };
        }
      );
      poems = Map.empty<Nat, Poem>();
      nextPoemId = 0;
    };
  };
};
