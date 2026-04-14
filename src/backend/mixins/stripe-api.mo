import Float "mo:core/Float";
import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import PTypes "../types/products";
import UTypes "../types/users";
import UserLib "../lib/users";

mixin (
  products : Map.Map<Text, PTypes.Product>,
  users : Map.Map<UTypes.UserId, UTypes.UserProfile>,
  principalToId : Map.Map<Principal, UTypes.UserId>,
) {

  // IC management canister for HTTP outcalls (Stripe)
  let icStripe = actor "aaaaa-aa" : actor {
    http_request : ({
      url : Text;
      max_response_bytes : ?Nat64;
      method : { #get; #head; #post };
      headers : [{ name : Text; value : Text }];
      body : ?Blob;
      transform : ?{
        function : shared query ({
          response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
          context : Blob;
        }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
        context : Blob;
      };
      is_replicated : ?Bool;
    }) -> async {
      status : Nat;
      headers : [{ name : Text; value : Text }];
      body : Blob;
    };
  };

  // URL percent-encoding for form values
  func urlEncode(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      if (
        (c >= 'A' and c <= 'Z') or
        (c >= 'a' and c <= 'z') or
        (c >= '0' and c <= '9') or
        c == '-' or c == '_' or c == '.' or c == '~'
      ) {
        result := result # Text.fromChar(c);
      } else if (c == ' ') {
        result := result # "+";
      } else {
        let n = c.toNat32().toNat();
        let hi = n / 16;
        let lo = n % 16;
        result := result # "%" # nibbleToHex(hi) # nibbleToHex(lo);
      };
    };
    result;
  };

  func nibbleToHex(n : Nat) : Text {
    let chars = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
    if (n < 16) chars[n] else "0";
  };

  // Build URL-encoded form body for Stripe API
  func encodeForm(pairs : [(Text, Text)]) : Blob {
    var body = "";
    var first = true;
    for ((k, v) in pairs.vals()) {
      if (not first) { body := body # "&" };
      body := body # k # "=" # urlEncode(v);
      first := false;
    };
    body.encodeUtf8();
  };

  // Extract a JSON string field from a response body
  func extractJsonField(json : Text, fieldName : Text) : ?Text {
    let marker = "\"" # fieldName # "\":\"";
    let chars = json.toArray();
    let markerChars = marker.toArray();
    let jsonSize = chars.size();
    let markerSize = markerChars.size();

    var i = 0;
    var foundStart = 0;
    var found = false;

    label search while (i + markerSize <= jsonSize) {
      var match = true;
      var j = 0;
      while (j < markerSize) {
        if (chars[i + j] != markerChars[j]) { match := false };
        j += 1;
      };
      if (match) {
        foundStart := i + markerSize;
        found := true;
        break search;
      };
      i += 1;
    };

    if (not found) return null;

    var value = "";
    var k = foundStart;
    var escaped = false;
    label extract while (k < jsonSize) {
      let ch = chars[k];
      if (escaped) {
        if (ch == '\"') { value := value # "\"" }
        else if (ch == '\\') { value := value # "\\" }
        else if (ch == 'n') { value := value # "\n" }
        else { value := value # Text.fromChar(ch) };
        escaped := false;
      } else if (ch == '\\') {
        escaped := true;
      } else if (ch == '\"') {
        break extract;
      } else {
        value := value # Text.fromChar(ch);
      };
      k += 1;
    };

    ?value;
  };

  /// Creates a Stripe Checkout Session for a product purchase.
  /// Returns the hosted checkout URL for the buyer to complete payment.
  /// The caller must be a registered user.
  ///
  /// NOTE: Replace "sk_test_YOUR_STRIPE_SECRET_KEY" below with your actual
  /// Stripe restricted secret key (checkout:write permission only).
  public shared ({ caller }) func createCheckoutSession(
    productId : Text,
    successUrl : Text,
    cancelUrl : Text,
  ) : async { checkoutUrl : Text } {
    ignore UserLib.requireRegistered(users, principalToId, caller);

    let product = switch (products.get(productId)) {
      case (?p) p;
      case null { Runtime.trap("Producto no encontrado") };
    };

    if (product.status != #active) {
      Runtime.trap("Este producto no está disponible para compra");
    };

    if (product.price <= 0.0) {
      Runtime.trap("Precio inválido");
    };

    // Convert Float price (MXN pesos) to integer centavos for Stripe
    let centavosFloat = product.price * 100.0;
    let centavosInt = centavosFloat.toInt();
    if (centavosInt < 0) { Runtime.trap("Precio inválido") };
    let amountCents : Nat = centavosInt.toNat();

    // Stripe secret key — replace with your actual restricted key
    let stripeKey = "sk_test_YOUR_STRIPE_SECRET_KEY";

    let formBody = encodeForm([
      ("mode", "payment"),
      ("payment_method_types[]", "card"),
      ("line_items[0][price_data][currency]", "mxn"),
      ("line_items[0][price_data][product_data][name]", product.title),
      ("line_items[0][price_data][unit_amount]", amountCents.toText()),
      ("line_items[0][quantity]", "1"),
      ("success_url", successUrl),
      ("cancel_url", cancelUrl),
      ("metadata[productId]", productId),
      ("metadata[sellerId]", product.sellerId),
    ]);

    let response = await icStripe.http_request({
      url = "https://api.stripe.com/v1/checkout/sessions";
      max_response_bytes = ?16384;
      method = #post;
      headers = [
        { name = "Authorization"; value = "Bearer " # stripeKey },
        { name = "Content-Type"; value = "application/x-www-form-urlencoded" },
      ];
      body = ?formBody;
      transform = null;
      is_replicated = ?true;
    });

    let responseText = switch (response.body.decodeUtf8()) {
      case (?t) t;
      case null { Runtime.trap("Error al procesar respuesta de Stripe") };
    };

    if (response.status != 200) {
      Runtime.trap("Error de Stripe: " # responseText);
    };

    let checkoutUrl = switch (extractJsonField(responseText, "url")) {
      case (?url) url;
      case null { Runtime.trap("No se pudo obtener la URL de pago de Stripe") };
    };

    { checkoutUrl };
  };
};
