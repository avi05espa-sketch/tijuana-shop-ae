import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/audit";

module {
  public type AuditLog = Types.AuditLog;
  public type AuditFilters = Types.AuditFilters;
  public type UserId = Types.UserId;

  func nextId(logs : List.List<AuditLog>) : Text {
    "audit-" # logs.size().toText() # "-" # Time.now().toText();
  };

  public func logAction(
    logs : List.List<AuditLog>,
    adminId : UserId,
    adminName : Text,
    action : Text,
    details : Text,
    affectedId : ?Text,
  ) : AuditLog {
    let entry : AuditLog = {
      id = nextId(logs);
      adminId = adminId;
      adminName = adminName;
      action = action;
      details = details;
      affectedId = affectedId;
      timestamp = Time.now();
      status = "completado";
    };
    logs.add(entry);
    entry;
  };

  public func listAuditLogs(
    logs : List.List<AuditLog>,
    filters : AuditFilters,
  ) : [AuditLog] {
    let filtered = logs.filter(func(log : AuditLog) : Bool {
      let matchAdmin = switch (filters.adminId) {
        case (?id) { log.adminId == id };
        case null { true };
      };
      let matchAction = switch (filters.actionType) {
        case (?t) { log.action == t };
        case null { true };
      };
      let matchFrom = switch (filters.fromDate) {
        case (?d) { log.timestamp >= d };
        case null { true };
      };
      let matchTo = switch (filters.toDate) {
        case (?d) { log.timestamp <= d };
        case null { true };
      };
      matchAdmin and matchAction and matchFrom and matchTo;
    });
    let all = filtered.toArray();
    let total = all.size();
    let pageSize = if (filters.pageSize == 0) 20 else filters.pageSize;
    let offset = filters.page * pageSize;
    if (offset >= total) {
      [];
    } else {
      let toIdx = if (offset + pageSize > total) total else offset + pageSize;
      all.sliceToArray(offset, toIdx);
    };
  };
};
