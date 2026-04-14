import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type ActivityEvent = {
    id : Text;
    userId : UserId;
    eventType : Text;
    description : Text;
    timestamp : Timestamp;
    relatedId : ?Text;
  };
};
