import Types "../types/config";

module {
  public type SiteConfig = Types.SiteConfig;

  public func defaultConfig() : SiteConfig {
    {
      siteName = "Tijuana Shop AE";
      siteDescription = "El marketplace local y seguro de Tijuana";
      logoUrl = "";
      contactEmail = "contacto@tijuanashopae.com";
      maintenanceMode = false;
      analyticsId = "";
      metaDescription = "Compra y vende productos locales en Tijuana de forma segura";
    };
  };

  public func getConfig(config : { var value : SiteConfig }) : SiteConfig {
    config.value;
  };

  public func updateConfig(
    config : { var value : SiteConfig },
    siteName : ?Text,
    siteDescription : ?Text,
    logoUrl : ?Text,
    contactEmail : ?Text,
    maintenanceMode : ?Bool,
    analyticsId : ?Text,
    metaDescription : ?Text,
  ) : SiteConfig {
    let existing = config.value;
    let updated : SiteConfig = {
      siteName = switch (siteName) { case (?v) v; case null existing.siteName };
      siteDescription = switch (siteDescription) { case (?v) v; case null existing.siteDescription };
      logoUrl = switch (logoUrl) { case (?v) v; case null existing.logoUrl };
      contactEmail = switch (contactEmail) { case (?v) v; case null existing.contactEmail };
      maintenanceMode = switch (maintenanceMode) { case (?v) v; case null existing.maintenanceMode };
      analyticsId = switch (analyticsId) { case (?v) v; case null existing.analyticsId };
      metaDescription = switch (metaDescription) { case (?v) v; case null existing.metaDescription };
    };
    config.value := updated;
    updated;
  };

  public func isMaintenanceMode(config : { var value : SiteConfig }) : Bool {
    config.value.maintenanceMode;
  };
};
