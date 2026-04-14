import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type ProductCategory = {
    #electronico;
    #mueble;
    #ropa;
    #auto;
    #otro;
  };

  public type ProductCondition = {
    #nuevo;
    #usado;
  };

  public type ProductStatus = {
    #active;
    #paused;
    #hidden;
    #blocked;
  };

  public type ProductZone = {
    #playas;
    #otay;
    #centro;
    #corredor2000;
  };

  // AssetId holds either an object-storage hash (from @caffeineai/object-storage
  // StorageClient.putFile) or a legacy URL for sample/seed data.
  // The frontend resolves hashes to URLs via StorageClient.getDirectURL(hash).
  public type AssetId = Text;

  public type Product = {
    id : Text;
    title : Text;
    description : Text;
    price : Float;
    negotiable : Bool;
    category : ProductCategory;
    condition : ProductCondition;
    zone : ProductZone;
    colony : Text;
    status : ProductStatus;
    sellerId : UserId;
    // Stores asset IDs (hashes) from object-storage extension or legacy URLs for seed data.
    photos : [AssetId];
    createdAt : Timestamp;
    views : Nat;
    featured : Bool;
    // WhatsApp contact number for direct seller contact
    whatsappContact : ?Text;
    // Whether the product is reserved/apartado
    isApartado : Bool;
  };

  public type ProductFilters = {
    category : ?ProductCategory;
    zone : ?ProductZone;
    condition : ?ProductCondition;
    priceMin : ?Float;
    priceMax : ?Float;
    searchTerm : ?Text;
    status : ?ProductStatus;
  };
};
