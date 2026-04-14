import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import PTypes "../types/products";
import UTypes "../types/users";

module {
  public type Product = PTypes.Product;
  public type ProductFilters = PTypes.ProductFilters;
  public type ProductStatus = PTypes.ProductStatus;
  public type UserId = UTypes.UserId;
  public type AssetId = PTypes.AssetId;

  func nextId(products : Map.Map<Text, Product>) : Text {
    "p-" # products.size().toText();
  };

  /// Returns true if the given string looks like an object-storage asset hash
  /// (64-char hex string) rather than a legacy URL.
  public func isAssetHash(id : AssetId) : Bool {
    id.size() == 64 and not id.startsWith(#text "http");
  };

  public func createProduct(
    products : Map.Map<Text, Product>,
    sellerId : UserId,
    title : Text,
    description : Text,
    price : Float,
    negotiable : Bool,
    category : PTypes.ProductCategory,
    condition : PTypes.ProductCondition,
    zone : PTypes.ProductZone,
    colony : Text,
    photos : [AssetId],
    whatsappContact : ?Text,
    isApartado : Bool,
  ) : Product {
    let pid = nextId(products);
    let product : Product = {
      id = pid;
      title = title;
      description = description;
      price = price;
      negotiable = negotiable;
      category = category;
      condition = condition;
      zone = zone;
      colony = colony;
      status = #active;
      sellerId = sellerId;
      photos = photos;
      createdAt = Time.now();
      views = 0;
      featured = false;
      whatsappContact = whatsappContact;
      isApartado = isApartado;
    };
    products.add(pid, product);
    product;
  };

  public func updateProduct(
    products : Map.Map<Text, Product>,
    caller : UserId,
    productId : Text,
    title : ?Text,
    description : ?Text,
    price : ?Float,
    negotiable : ?Bool,
    category : ?PTypes.ProductCategory,
    condition : ?PTypes.ProductCondition,
    zone : ?PTypes.ProductZone,
    colony : ?Text,
    photos : ?[AssetId],
    whatsappContact : ?Text,
    isApartado : ?Bool,
  ) : Product {
    let existing = switch (products.get(productId)) {
      case (?p) { p };
      case null { Runtime.trap("Producto no encontrado") };
    };
    if (existing.sellerId != caller) {
      Runtime.trap("Solo el vendedor puede editar este producto");
    };
    let updated : Product = {
      existing with
      title = switch (title) { case (?t) t; case null existing.title };
      description = switch (description) { case (?d) d; case null existing.description };
      price = switch (price) { case (?pr) pr; case null existing.price };
      negotiable = switch (negotiable) { case (?n) n; case null existing.negotiable };
      category = switch (category) { case (?c) c; case null existing.category };
      condition = switch (condition) { case (?c) c; case null existing.condition };
      zone = switch (zone) { case (?z) z; case null existing.zone };
      colony = switch (colony) { case (?co) co; case null existing.colony };
      photos = switch (photos) { case (?ph) ph; case null existing.photos };
      whatsappContact = switch (whatsappContact) { case (?w) ?w; case null existing.whatsappContact };
      isApartado = switch (isApartado) { case (?a) a; case null existing.isApartado };
    };
    products.add(productId, updated);
    updated;
  };

  public func getProduct(
    products : Map.Map<Text, Product>,
    productId : Text,
  ) : ?Product {
    products.get(productId);
  };

  public func listProducts(
    products : Map.Map<Text, Product>,
    filters : ProductFilters,
  ) : [Product] {
    products.values().filter(func(p : Product) : Bool {
      let statusMatch = switch (filters.status) {
        case (?s) { p.status == s };
        case null { p.status == #active };
      };
      let categoryMatch = switch (filters.category) {
        case (?c) { p.category == c };
        case null { true };
      };
      let zoneMatch = switch (filters.zone) {
        case (?z) { p.zone == z };
        case null { true };
      };
      let conditionMatch = switch (filters.condition) {
        case (?c) { p.condition == c };
        case null { true };
      };
      let priceMinMatch = switch (filters.priceMin) {
        case (?minVal) { p.price >= minVal };
        case null { true };
      };
      let priceMaxMatch = switch (filters.priceMax) {
        case (?maxVal) { p.price <= maxVal };
        case null { true };
      };
      let searchMatch = switch (filters.searchTerm) {
        case (?term) {
          let lower = term.toLower();
          p.title.toLower().contains(#text lower) or
          p.description.toLower().contains(#text lower) or
          p.colony.toLower().contains(#text lower)
        };
        case null { true };
      };
      statusMatch and categoryMatch and zoneMatch and conditionMatch and
      priceMinMatch and priceMaxMatch and searchMatch
    }).toArray();
  };

  public func getProductsByVendor(
    products : Map.Map<Text, Product>,
    sellerId : UserId,
  ) : [Product] {
    products.values().filter(func(p : Product) : Bool { p.sellerId == sellerId }).toArray();
  };

  public func updateProductStatus(
    products : Map.Map<Text, Product>,
    callerId : UserId,
    isAdmin : Bool,
    productId : Text,
    status : ProductStatus,
  ) : Product {
    let existing = switch (products.get(productId)) {
      case (?p) { p };
      case null { Runtime.trap("Producto no encontrado") };
    };
    if (not isAdmin and existing.sellerId != callerId) {
      Runtime.trap("No tienes permiso para cambiar el estado de este producto");
    };
    let updated : Product = { existing with status = status };
    products.add(productId, updated);
    updated;
  };

  public func deleteProduct(
    products : Map.Map<Text, Product>,
    callerId : UserId,
    isAdmin : Bool,
    productId : Text,
  ) : () {
    let existing = switch (products.get(productId)) {
      case (?p) { p };
      case null { Runtime.trap("Producto no encontrado") };
    };
    if (not isAdmin and existing.sellerId != callerId) {
      Runtime.trap("No tienes permiso para eliminar este producto");
    };
    products.remove(productId);
  };

  public func incrementViews(
    products : Map.Map<Text, Product>,
    productId : Text,
  ) : () {
    switch (products.get(productId)) {
      case (?p) {
        products.add(productId, { p with views = p.views + 1 });
      };
      case null {};
    };
  };

  public func featureProduct(
    products : Map.Map<Text, Product>,
    productId : Text,
    featured : Bool,
  ) : Product {
    let existing = switch (products.get(productId)) {
      case (?p) { p };
      case null { Runtime.trap("Producto no encontrado") };
    };
    let updated : Product = { existing with featured = featured };
    products.add(productId, updated);
    updated;
  };

  public func seedSampleData(
    products : Map.Map<Text, Product>,
  ) : Nat {
    if (products.size() > 0) { return 0 };

    type SeedEntry = {
      title : Text;
      desc : Text;
      price : Float;
      negotiable : Bool;
      category : PTypes.ProductCategory;
      condition : PTypes.ProductCondition;
      zone : PTypes.ProductZone;
      colony : Text;
      featured : Bool;
    };

    let samples : [SeedEntry] = [
      // Electrónicos - Playas
      { title = "iPhone 13 128GB - Excelente estado";
        desc = "iPhone 13 en perfecto estado, sin rayones, batería al 91%. Incluye cargador original y funda de regalo. Desbloqueado para cualquier compañía.";
        price = 8500.0; negotiable = true; category = #electronico; condition = #usado;
        zone = #playas; colony = "Playas de Tijuana"; featured = true },
      // Electrónicos - Centro
      { title = "Samsung Smart TV 55 pulgadas 4K";
        desc = "Televisor Samsung de 55 pulgadas 4K UHD. Apenas 6 meses de uso, funciona perfectamente. Control remoto incluido. Ideal para sala o recámara.";
        price = 9800.0; negotiable = true; category = #electronico; condition = #usado;
        zone = #centro; colony = "Centro Histórico"; featured = false },
      // Electrónicos - Otay
      { title = "Laptop HP Pavilion Core i5 8GB RAM";
        desc = "Laptop HP Pavilion i5 de 10a generación, 8GB RAM, 256GB SSD. Windows 11 activado. Perfecta para trabajo y estudio. Cargador incluido.";
        price = 7200.0; negotiable = false; category = #electronico; condition = #usado;
        zone = #otay; colony = "Otay"; featured = true },
      // Electrónicos - Corredor 2000
      { title = "AirPods Pro 2da Generación - Nuevos";
        desc = "AirPods Pro 2da generación, caja sellada. Cancelación de ruido activa, resistentes al agua. Garantía Apple incluida.";
        price = 3200.0; negotiable = false; category = #electronico; condition = #nuevo;
        zone = #corredor2000; colony = "Corredor 2000"; featured = false },
      // Electrónicos - Playas
      { title = "PlayStation 5 con 2 controles";
        desc = "PS5 edición estándar con lector de disco. Incluye 2 controles DualSense y 3 juegos físicos. Todo en perfectas condiciones.";
        price = 12000.0; negotiable = true; category = #electronico; condition = #usado;
        zone = #playas; colony = "Playas de Tijuana"; featured = true },
      // Muebles - Corredor 2000
      { title = "Sala de 3 piezas color gris moderno";
        desc = "Sala de 3 piezas en tela antimanchas color gris. Sofá de 3 lugares, loveseat y silla individual. Apenas 1 año de uso, excelente estado.";
        price = 6500.0; negotiable = true; category = #mueble; condition = #usado;
        zone = #corredor2000; colony = "Corredor 2000"; featured = false },
      // Muebles - Otay
      { title = "Cama matrimonial con colchón incluido";
        desc = "Cama matrimonial de madera maciza con colchón Sealy de pillow top. Todo en muy buen estado. Por cambio de habitación.";
        price = 4800.0; negotiable = true; category = #mueble; condition = #usado;
        zone = #otay; colony = "Otay"; featured = false },
      // Muebles - Centro
      { title = "Escritorio de vidrio con silla ergonómica";
        desc = "Escritorio de vidrio templado con estructura metálica negra. Incluye silla ergonómica con soporte lumbar. Ideal para home office.";
        price = 3500.0; negotiable = false; category = #mueble; condition = #nuevo;
        zone = #centro; colony = "Centro Histórico"; featured = false },
      // Ropa - Playas
      { title = "Bolsa Louis Vuitton Speedy 30 original";
        desc = "Bolsa Louis Vuitton Speedy 30 original con certificado de autenticidad. Usada pocas veces, en excelente estado. Incluye estuche original.";
        price = 4500.0; negotiable = false; category = #ropa; condition = #usado;
        zone = #playas; colony = "Playas de Tijuana"; featured = true },
      // Ropa - Otay
      { title = "Lote ropa de bebé talla 0-12 meses";
        desc = "Lote de 20 piezas de ropa de bebé tallas 0 a 12 meses. Playeras, pijamas, pantalones y conjuntos. Todo en buen estado.";
        price = 450.0; negotiable = false; category = #ropa; condition = #usado;
        zone = #otay; colony = "Otay"; featured = false },
      // Ropa - Corredor 2000
      { title = "Tenis Nike Air Max 270 talla 27";
        desc = "Tenis Nike Air Max 270 originales talla 27 (43 EU). Solo usados 2 veces, como nuevos. Color blanco con suela negra.";
        price = 1800.0; negotiable = false; category = #ropa; condition = #usado;
        zone = #corredor2000; colony = "Corredor 2000"; featured = false },
      // Ropa - Centro
      { title = "Chamarra de cuero genuino talla L";
        desc = "Chamarra de cuero genuino color negro talla L. Estilo clásico, varios bolsillos. Perfecta para temporada de frío en TJ.";
        price = 1200.0; negotiable = true; category = #ropa; condition = #usado;
        zone = #centro; colony = "Centro Histórico"; featured = false },
      // Autos - Playas
      { title = "Honda Civic 2018 automático poco uso";
        desc = "Honda Civic 2018 sedán automático, color blanco perla. 65,000 km, único dueño, historial de servicio completo. Factura disponible.";
        price = 195000.0; negotiable = true; category = #auto; condition = #usado;
        zone = #playas; colony = "Playas de Tijuana"; featured = true },
      // Autos - Otay
      { title = "Volkswagen Jetta 2020 TDI diésel";
        desc = "VW Jetta 2020 versión Comfortline TDI diésel. 35,000 km, excelente rendimiento. Seguro vigente y placas de BC. Acepto auto a cuenta.";
        price = 245000.0; negotiable = true; category = #auto; condition = #usado;
        zone = #otay; colony = "Otay"; featured = false },
      // Autos - Corredor 2000
      { title = "Motocicleta Honda CB300R 2022";
        desc = "Moto Honda CB300R 2022 color antracita. 8,000 km, revisión reciente, todo en orden. Ideal para ciudad y carretera. Casco de regalo.";
        price = 55000.0; negotiable = false; category = #auto; condition = #usado;
        zone = #corredor2000; colony = "Corredor 2000"; featured = true },
      // Autos - Playas
      { title = "Bicicleta de montaña Specialized Rockhopper";
        desc = "Bicicleta Specialized Rockhopper rodada 29, talla M. 21 velocidades Shimano, frenos de disco. Usada en rines locales, excelente estado.";
        price = 7500.0; negotiable = true; category = #auto; condition = #usado;
        zone = #playas; colony = "Playas de Tijuana"; featured = false },
      // Otro - Centro
      { title = "Guitarra acústica Yamaha F310 con funda";
        desc = "Guitarra acústica Yamaha F310, perfecta para principiantes y nivel intermedio. Con funda acolchada y correa. Poco uso.";
        price = 1500.0; negotiable = false; category = #otro; condition = #usado;
        zone = #centro; colony = "Centro Histórico"; featured = false },
      // Otro - Otay
      { title = "Kit completo de herramientas Stanley 120 pzs";
        desc = "Caja de herramientas Stanley con 120 piezas: llaves, desarmadores, dados, alicates. Caja con gavetas de rodillos. Casi sin uso.";
        price = 2800.0; negotiable = true; category = #otro; condition = #nuevo;
        zone = #otay; colony = "Otay"; featured = false },
      // Otro - Corredor 2000
      { title = "Colección libros Gabriel García Márquez";
        desc = "Colección completa de 12 libros de Gabriel García Márquez en pasta dura. Edición especial Norma. En perfecto estado.";
        price = 650.0; negotiable = false; category = #otro; condition = #usado;
        zone = #corredor2000; colony = "Corredor 2000"; featured = false },
      // Otro - Playas
      { title = "Mesa de ping-pong profesional con accesorios";
        desc = "Mesa de ping-pong profesional con medidas oficiales. Incluye red, 2 raquetas y 12 pelotas. Plegable para fácil almacenamiento.";
        price = 3200.0; negotiable = true; category = #otro; condition = #usado;
        zone = #playas; colony = "Playas de Tijuana"; featured = false },
    ];

    var count = 0;
    for (s in samples.vals()) {
      let pid = "p-" # count.toText();
      let product : Product = {
        id = pid;
        title = s.title;
        description = s.desc;
        price = s.price;
        negotiable = s.negotiable;
        category = s.category;
        condition = s.condition;
        zone = s.zone;
        colony = s.colony;
        status = #active;
        sellerId = "vendor-seed-001";
        photos = ["https://picsum.photos/seed/" # pid # "/800/600"];
        createdAt = Time.now();
        views = count * 7 + 3;
        featured = s.featured;
        whatsappContact = null;
        isApartado = false;
      };
      products.add(pid, product);
      count += 1;
    };
    count;
  };
};
