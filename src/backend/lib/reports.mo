import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import RTypes "../types/reports";
import UTypes "../types/users";

module {
  public type Report = RTypes.Report;
  public type ReportStatus = RTypes.ReportStatus;
  public type ReportType = RTypes.ReportType;
  public type UserId = UTypes.UserId;

  func nextId(reports : List.List<Report>) : Text {
    "rep-" # reports.size().toText();
  };

  public func createReport(
    reports : List.List<Report>,
    reporterId : UserId,
    reportType : ReportType,
    entityId : Text,
    reason : Text,
    description : Text,
  ) : Report {
    let report : Report = {
      id = nextId(reports);
      reportType = reportType;
      entityId = entityId;
      reporterId = reporterId;
      reason = reason;
      description = description;
      status = #new;
      adminNote = null;
      createdAt = Time.now();
    };
    reports.add(report);
    report;
  };

  public func listReports(
    reports : List.List<Report>,
  ) : [Report] {
    reports.toArray();
  };

  public func updateReportStatus(
    reports : List.List<Report>,
    reportId : Text,
    status : ReportStatus,
  ) : Report {
    let existing = switch (reports.find(func(r : Report) : Bool { r.id == reportId })) {
      case (?r) { r };
      case null { Runtime.trap("Reporte no encontrado") };
    };
    let updated : Report = { existing with status = status };
    reports.mapInPlace(func(r : Report) : Report {
      if (r.id == reportId) { updated } else { r }
    });
    updated;
  };

  public func addAdminNote(
    reports : List.List<Report>,
    reportId : Text,
    note : Text,
  ) : Report {
    let existing = switch (reports.find(func(r : Report) : Bool { r.id == reportId })) {
      case (?r) { r };
      case null { Runtime.trap("Reporte no encontrado") };
    };
    let updated : Report = { existing with adminNote = ?note };
    reports.mapInPlace(func(r : Report) : Report {
      if (r.id == reportId) { updated } else { r }
    });
    updated;
  };

  public func countPending(
    reports : List.List<Report>,
  ) : Nat {
    reports.filter(func(r : Report) : Bool { r.status == #new or r.status == #inReview }).size();
  };
};
