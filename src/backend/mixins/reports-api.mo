import List "mo:core/List";
import Map "mo:core/Map";
import RTypes "../types/reports";
import UTypes "../types/users";
import ReportLib "../lib/reports";
import UserLib "../lib/users";

mixin (
  reports : List.List<RTypes.Report>,
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
) {

  public shared ({ caller }) func createReport(
    reportType : RTypes.ReportType,
    entityId : Text,
    reason : Text,
    description : Text,
  ) : async RTypes.Report {
    let user = UserLib.requireRegistered(users, principalToId, caller);
    ReportLib.createReport(reports, user.id, reportType, entityId, reason, description);
  };

  public shared query ({ caller }) func listReports() : async [RTypes.Report] {
    UserLib.requireAdmin(users, principalToId, caller);
    ReportLib.listReports(reports);
  };

  public shared ({ caller }) func updateReportStatus(
    reportId : Text,
    status : RTypes.ReportStatus,
  ) : async RTypes.Report {
    UserLib.requireAdmin(users, principalToId, caller);
    ReportLib.updateReportStatus(reports, reportId, status);
  };

  public shared ({ caller }) func addAdminNote(
    reportId : Text,
    note : Text,
  ) : async RTypes.Report {
    UserLib.requireAdmin(users, principalToId, caller);
    ReportLib.addAdminNote(reports, reportId, note);
  };
};
