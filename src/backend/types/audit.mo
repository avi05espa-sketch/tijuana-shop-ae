import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type AuditLog = {
    id : Text;
    adminId : UserId;
    adminName : Text;
    action : Text;
    details : Text;
    affectedId : ?Text;
    timestamp : Timestamp;
    status : Text;
  };

  public type AuditFilters = {
    adminId : ?UserId;
    actionType : ?Text;
    fromDate : ?Timestamp;
    toDate : ?Timestamp;
    page : Nat;
    pageSize : Nat;
  };
};
