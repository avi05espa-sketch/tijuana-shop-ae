import Map "mo:core/Map";
import CTypes "../types/config";
import UTypes "../types/users";
import ConfigLib "../lib/config";
import UserLib "../lib/users";

mixin (
  siteConfig : { var value : CTypes.SiteConfig },
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
) {

  public shared query func getConfig() : async CTypes.SiteConfig {
    ConfigLib.getConfig(siteConfig);
  };

  public shared ({ caller }) func updateConfig(
    siteName : ?Text,
    siteDescription : ?Text,
    logoUrl : ?Text,
    contactEmail : ?Text,
    maintenanceMode : ?Bool,
    analyticsId : ?Text,
    metaDescription : ?Text,
  ) : async CTypes.SiteConfig {
    UserLib.requireAdmin(users, principalToId, caller);
    ConfigLib.updateConfig(siteConfig, siteName, siteDescription, logoUrl, contactEmail, maintenanceMode, analyticsId, metaDescription);
  };

  public shared query func isMaintenanceMode() : async Bool {
    ConfigLib.isMaintenanceMode(siteConfig);
  };
};
