import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type ReportType = {
    #product;
    #user;
    #chat;
  };

  public type ReportStatus = {
    #new;
    #inReview;
    #resolved;
  };

  public type Report = {
    id : Text;
    reportType : ReportType;
    entityId : Text;
    reporterId : UserId;
    reason : Text;
    description : Text;
    status : ReportStatus;
    adminNote : ?Text;
    createdAt : Timestamp;
  };
};
