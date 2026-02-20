import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
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

  public type UserProfile = {
    name : Text;
    role : Text;
    photo : Storage.ExternalBlob;
    studentId : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

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

  public type Student = {
    id : Text;
    name : Text;
    className : Text;
    photo : Storage.ExternalBlob;
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
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    students.add(student.id, student);
  };

  public shared ({ caller }) func removeStudent(id : Text) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove students");
    };
    students.remove(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view students");
    };
    students.values().toArray().sort();
  };

  public query ({ caller }) func getStudentsByClass(className : Text) : async [Student] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view students");
    };
    students.values().toArray().filter(
      func(student) {
        Text.equal(student.className, className);
      }
    ).sort();
  };

  public query ({ caller }) func getStudentsByName() : async [Student] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view students");
    };
    students.values().toArray().sort(Student.compareByName);
  };

  public query ({ caller }) func getStudentsById() : async [Student] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view students");
    };
    students.values().toArray().sort(Student.compareById);
  };

  // Teacher Profile System
  public type TeacherProfile = {
    id : Text;
    name : Text;
    subjects : [Text];
    qualifications : Text;
    contactInfo : Text;
    photo : Storage.ExternalBlob;
    officeHours : Text;
  };

  module TeacherProfile {
    public func compareByName(profile1 : TeacherProfile, profile2 : TeacherProfile) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };
  };

  let teacherProfiles = Map.empty<Text, TeacherProfile>();

  public shared ({ caller }) func addTeacherProfile(profile : TeacherProfile) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add teacher profiles");
    };
    teacherProfiles.add(profile.id, profile);
  };

  public shared ({ caller }) func updateTeacherProfile(profile : TeacherProfile) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update teacher profiles");
    };
    switch (teacherProfiles.get(profile.id)) {
      case (null) {
        Runtime.trap("Teacher profile not found");
      };
      case (?_) {
        teacherProfiles.add(profile.id, profile);
      };
    };
  };

  public shared ({ caller }) func removeTeacherProfile(id : Text) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove teacher profiles");
    };
    teacherProfiles.remove(id);
  };

  public query ({ caller }) func getTeacherProfile(id : Text) : async ?TeacherProfile {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view teacher profiles");
    };
    teacherProfiles.get(id);
  };

  public query ({ caller }) func getAllTeacherProfiles() : async [TeacherProfile] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view teacher profiles");
    };
    teacherProfiles.values().toArray().sort(TeacherProfile.compareByName);
  };

  public query ({ caller }) func getTeacherProfilesBySubject(subject : Text) : async [TeacherProfile] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view teacher profiles");
    };
    teacherProfiles.values().toArray().filter(
      func(profile) {
        profile.subjects.find(func(s) { Text.equal(s, subject) }) != null;
      }
    );
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
    if (not Authorization.isAdmin(accessControlState, caller)) {
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
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove announcements");
    };
    announcements.remove(id);
  };

  public query ({ caller }) func getAllAnnouncements() : async [Announcement] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view announcements");
    };
    announcements.values().toArray().sort(Announcement.compareByTimestamp);
  };

  // Exam Results System
  public type ExamResult = {
    studentId : Text;
    examName : Text;
    subject : Text;
    grade : Text;
    percentage : Nat;
    examDate : Time.Time;
    remarks : Text;
  };

  let examResults = Map.empty<Text, [ExamResult]>();

  public shared ({ caller }) func addExamResult(result : ExamResult) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add exam results");
    };
    let existingResults = switch (examResults.get(result.studentId)) {
      case (null) { [] };
      case (?results) { results };
    };
    examResults.add(result.studentId, existingResults.concat([result]));
  };

  public shared ({ caller }) func updateExamResult(result : ExamResult) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update exam results");
    };
    switch (examResults.get(result.studentId)) {
      case (?results) {
        let updatedResults = results.map(
          func(r : ExamResult) : ExamResult {
            if (Text.equal(r.examName, result.examName) and Text.equal(r.subject, result.subject)) {
              result;
            } else {
              r;
            };
          }
        );
        examResults.add(result.studentId, updatedResults);
      };
      case (null) {
        Runtime.trap("Student has no exam results");
      };
    };
  };

  public shared ({ caller }) func removeExamResult(studentId : Text, examName : Text) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove exam results");
    };
    switch (examResults.get(studentId)) {
      case (?results) {
        let filteredResults = results.filter(
          func(result) {
            not Text.equal(result.examName, examName);
          }
        );
        if (filteredResults.size() == 0) {
          examResults.remove(studentId);
        } else {
          examResults.add(studentId, filteredResults);
        };
      };
      case (null) {};
    };
  };

  func getCallerStudentId(caller : Principal) : ?Text {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.studentId };
      case (null) { null };
    };
  };

  public query ({ caller }) func getStudentExamResults(studentId : Text) : async [ExamResult] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view exam results");
    };

    if (not Authorization.isAdmin(accessControlState, caller)) {
      let callerStudentId = getCallerStudentId(caller);
      switch (callerStudentId) {
        case (?id) {
          if (not Text.equal(id, studentId)) {
            Runtime.trap("Unauthorized: Students can only view their own exam results");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: User profile does not have a student ID");
        };
      };
    };

    switch (examResults.get(studentId)) {
      case (null) { [] };
      case (?results) { results };
    };
  };

  public query ({ caller }) func getAllExamResults() : async [ExamResult] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all exam results");
    };
    let allResults = examResults.values().toArray().flatten();
    allResults;
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
    if (not Authorization.isAdmin(accessControlState, caller)) {
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
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove class schedules");
    };
    classSchedules.remove(section);
  };

  public query ({ caller }) func getAllClassSchedules() : async [ClassSchedule] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view class schedules");
    };
    classSchedules.values().toArray();
  };

  public query ({ caller }) func getClassSchedulesByGrade(grade : Text) : async [ClassSchedule] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view class schedules");
    };
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
    if (not Authorization.isAdmin(accessControlState, caller)) {
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
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove events");
    };
    events.remove(id);
  };

  public query ({ caller }) func getAllEvents() : async [Event] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view events");
    };
    events.values().toArray().sort(Event.compareByDate);
  };

  public type PhotoCategory = {
    #general;
    #events;
    #achievements;
    #facilities;
  };

  public type PhotoRecord = {
    id : Nat;
    title : Text;
    description : Text;
    category : PhotoCategory;
    image : Storage.ExternalBlob;
    uploadedBy : Text;
    timestamp : Time.Time;
  };

  let photoRecords = Map.empty<Nat, PhotoRecord>();
  var nextPhotoId = 0;

  public shared ({ caller }) func addPhotoRecord(record : PhotoRecord) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add photo records");
    };
    photoRecords.add(nextPhotoId, { record with id = nextPhotoId });
    nextPhotoId += 1;
  };

  public shared ({ caller }) func updatePhotoRecord(record : PhotoRecord) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update photo records");
    };
    switch (photoRecords.get(record.id)) {
      case (null) {
        Runtime.trap("Photo record not found");
      };
      case (?_) {
        photoRecords.add(record.id, record);
      };
    };
  };

  public shared ({ caller }) func removePhotoRecord(id : Nat) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove photo records");
    };
    photoRecords.remove(id);
  };

  public query ({ caller }) func getAllPhotoRecords() : async [PhotoRecord] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view photo records");
    };
    photoRecords.values().toArray();
  };

  public query ({ caller }) func getPhotoRecordsByCategory(category : PhotoCategory) : async [PhotoRecord] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view photo records");
    };
    photoRecords.values().toArray().filter(
      func(record) {
        record.category == category;
      }
    );
  };

  // Library Management System
  public type Book = {
    id : Nat;
    title : Text;
    author : Text;
    isbn : Text;
    category : Text;
    availableCopies : Nat;
    thumbnail : Storage.ExternalBlob;
    totalCopies : Nat;
  };

  let books = Map.empty<Nat, Book>();
  var nextBookId = 0;

  public shared ({ caller }) func addBook(book : Book) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add books");
    };
    books.add(nextBookId, { book with id = nextBookId });
    nextBookId += 1;
  };

  public shared ({ caller }) func updateBook(book : Book) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update books");
    };
    switch (books.get(book.id)) {
      case (null) {
        Runtime.trap("Book not found");
      };
      case (?_) {
        books.add(book.id, book);
      };
    };
  };

  public shared ({ caller }) func removeBook(id : Nat) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove books");
    };
    books.remove(id);
  };

  public query ({ caller }) func getAllBooks() : async [Book] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view books");
    };
    books.values().toArray();
  };

  public query ({ caller }) func getBooksByCategory(category : Text) : async [Book] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view books");
    };
    books.values().toArray().filter(
      func(book) {
        Text.equal(book.category, category);
      }
    );
  };

  public query ({ caller }) func getAvailableBooks() : async [Book] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view available books");
    };
    books.values().toArray().filter(
      func(book) {
        book.availableCopies > 0;
      }
    );
  };

  public type BorrowStatus = {
    #borrowed;
    #returned;
    #overdue;
  };

  public type BorrowingRecord = {
    id : Nat;
    bookId : Nat;
    studentId : Text;
    borrowDate : Time.Time;
    dueDate : Time.Time;
    returnDate : ?Time.Time;
    status : BorrowStatus;
  };

  let borrowingRecords = Map.empty<Nat, BorrowingRecord>();
  var nextBorrowingId = 0;

  public shared ({ caller }) func borrowBook(bookId : Nat, studentId : Text, dueDate : Time.Time) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create borrowing records");
    };

    switch (books.get(bookId)) {
      case (?book) {
        if (book.availableCopies == 0) {
          Runtime.trap("Book not available");
        };
        let record : BorrowingRecord = {
          id = nextBorrowingId;
          bookId;
          studentId;
          borrowDate = Time.now();
          dueDate;
          returnDate = null;
          status = #borrowed;
        };
        borrowingRecords.add(nextBorrowingId, record);
        nextBorrowingId += 1;

        books.add(bookId, { book with availableCopies = if (book.availableCopies > 0) { book.availableCopies - 1 } else { 0 } });
      };
      case (null) {
        Runtime.trap("Book not found");
      };
    };
  };

  public shared ({ caller }) func returnBook(borrowingId : Nat) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can process book returns");
    };

    switch (borrowingRecords.get(borrowingId)) {
      case (?record) {
        let updatedRecord = {
          record with
          returnDate = ?Time.now();
          status = #returned;
        };
        borrowingRecords.add(borrowingId, updatedRecord);

        switch (books.get(record.bookId)) {
          case (?book) {
            books.add(record.bookId, { book with
              availableCopies = book.availableCopies + 1 });
          };
          case (null) {};
        };
      };
      case (null) {
        Runtime.trap("Borrowing record not found");
      };
    };
  };

  public shared ({ caller }) func updateBorrowingStatus(borrowingId : Nat, status : BorrowStatus) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update borrowing status");
    };

    switch (borrowingRecords.get(borrowingId)) {
      case (?record) {
        borrowingRecords.add(borrowingId, { record with status });
      };
      case (null) {
        Runtime.trap("Borrowing record not found");
      };
    };
  };

  public query ({ caller }) func getStudentBorrowingHistory(studentId : Text) : async [BorrowingRecord] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view borrowing history");
    };

    if (not Authorization.isAdmin(accessControlState, caller)) {
      let callerStudentId = getCallerStudentId(caller);
      switch (callerStudentId) {
        case (?id) {
          if (not Text.equal(id, studentId)) {
            Runtime.trap("Unauthorized: Students can only view their own borrowing history");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: User profile does not have a student ID");
        };
      };
    };

    borrowingRecords.values().toArray().filter(
      func(record) {
        Text.equal(record.studentId, studentId);
      }
    );
  };

  public query ({ caller }) func getAllBorrowingRecords() : async [BorrowingRecord] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all borrowing records");
    };
    borrowingRecords.values().toArray();
  };

  public query ({ caller }) func getActiveBorrowings() : async [BorrowingRecord] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view active borrowings");
    };
    borrowingRecords.values().toArray().filter(
      func(record) {
        switch (record.status) {
          case (#borrowed) { true };
          case (#overdue) { true };
          case (#returned) { false };
        };
      }
    );
  };

  // Fee Payment System
  public type FeeStatus = {
    #pending;
    #partial;
    #paid;
    #overdue;
  };

  public type FeeRecord = {
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

  let feeRecords = Map.empty<Nat, FeeRecord>();
  var nextFeeId = 0;

  public shared ({ caller }) func addFeeRecord(record : FeeRecord) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add fee records");
    };
    feeRecords.add(nextFeeId, { record with id = nextFeeId });
    nextFeeId += 1;
  };

  public shared ({ caller }) func updateFeeRecord(record : FeeRecord) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update fee records");
    };
    switch (feeRecords.get(record.id)) {
      case (null) {
        Runtime.trap("Fee record not found");
      };
      case (?_) {
        feeRecords.add(record.id, record);
      };
    };
  };

  public shared ({ caller }) func removeFeeRecord(id : Nat) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove fee records");
    };
    feeRecords.remove(id);
  };

  public query ({ caller }) func getStudentFeeRecords(studentId : Text) : async [FeeRecord] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view fee records");
    };

    if (not Authorization.isAdmin(accessControlState, caller)) {
      let callerStudentId = getCallerStudentId(caller);
      switch (callerStudentId) {
        case (?id) {
          if (not Text.equal(id, studentId)) {
            Runtime.trap("Unauthorized: Students can only view their own fee records");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: User profile does not have a student ID");
        };
      };
    };

    feeRecords.values().toArray().filter(
      func(record) {
        Text.equal(record.studentId, studentId);
      }
    );
  };

  public query ({ caller }) func getAllFeeRecords() : async [FeeRecord] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all fee records");
    };
    feeRecords.values().toArray();
  };

  public type PaymentTransaction = {
    id : Nat;
    feeId : Nat;
    studentId : Text;
    amount : Nat;
    paymentDate : Time.Time;
    paymentMethod : Text;
    transactionId : Text;
  };

  let paymentTransactions = Map.empty<Nat, PaymentTransaction>();
  var nextPaymentId = 0;

  public shared ({ caller }) func recordPayment(transaction : PaymentTransaction) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can record payments");
    };

    paymentTransactions.add(nextPaymentId, { transaction with id = nextPaymentId });
    nextPaymentId += 1;

    switch (feeRecords.get(transaction.feeId)) {
      case (?fee) {
        let newPaidAmount = fee.paidAmount + transaction.amount;
        let newStatus = if (newPaidAmount >= fee.amount) {
          #paid;
        } else {
          #partial;
        };
        feeRecords.add(transaction.feeId, {
          fee with
          paidAmount = newPaidAmount;
          paidDate = ?transaction.paymentDate;
          status = newStatus;
        });
      };
      case (null) {
        Runtime.trap("Fee record not found");
      };
    };
  };

  public query ({ caller }) func getStudentPaymentHistory(studentId : Text) : async [PaymentTransaction] {
    if (not Authorization.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view payment history");
    };

    if (not Authorization.isAdmin(accessControlState, caller)) {
      let callerStudentId = getCallerStudentId(caller);
      switch (callerStudentId) {
        case (?id) {
          if (not Text.equal(id, studentId)) {
            Runtime.trap("Unauthorized: Students can only view their own payment history");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: User profile does not have a student ID");
        };
      };
    };

    paymentTransactions.values().toArray().filter(
      func(transaction) {
        Text.equal(transaction.studentId, studentId);
      }
    );
  };

  public query ({ caller }) func getAllPaymentTransactions() : async [PaymentTransaction] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all payment transactions");
    };
    paymentTransactions.values().toArray();
  };

  // Contact Form System
  public type ContactForm = {
    id : Nat;
    senderName : Text;
    senderEmail : Text;
    subject : Text;
    message : Text;
    timestamp : Time.Time;
    status : ContactStatus;
    studentId : ?Text;
  };

  public type ContactStatus = {
    #new;
    #read;
    #replied;
  };

  let contactForms = Map.empty<Nat, ContactForm>();
  var nextContactFormId = 0;

  public shared ({ caller }) func submitContactForm(form : ContactForm) : async () {
    contactForms.add(nextContactFormId, {
      form with id = nextContactFormId;
      status = #new;
      timestamp = Time.now();
    });
    nextContactFormId += 1;
  };

  public shared ({ caller }) func updateContactStatus(id : Nat, status : ContactStatus) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update contact status");
    };
    let form = switch (contactForms.get(id)) {
      case (?f) { f };
      case (null) { Runtime.trap("Contact form not found. ") };
    };
    contactForms.add(id, { form with status });
  };

  public shared ({ caller }) func deleteContactForm(id : Nat) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete contact forms");
    };
    contactForms.remove(id);
  };

  public query ({ caller }) func getAllContactForms() : async [ContactForm] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all contact forms");
    };
    contactForms.values().toArray();
  };

  public query ({ caller }) func getContactFormsByStatus(status : ContactStatus) : async [ContactForm] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view contact forms by status");
    };
    contactForms.values().toArray().filter(
      func(form) {
        switch (form.status, status) {
          case (#new, #new) { true };
          case (#read, #read) { true };
          case (#replied, #replied) { true };
          case (_) { false };
        };
      }
    );
  };
};
