import HTypes "../types/http-outcalls";
import HLib "../lib/http-outcalls";
import Text "mo:core/Text";
import Nat64 "mo:core/Nat64";

mixin () {

  // IC management canister for HTTP outcalls
  let ic = actor "aaaaa-aa" : actor {
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

  public shared func chatWithAviBot(
    message : Text,
    conversationHistory : [HTypes.ChatMessage],
  ) : async Text {
    let requestBody = HLib.buildRequestBody(message, conversationHistory);

    let response = await ic.http_request({
      url = "https://text.pollinations.ai/openai";
      max_response_bytes = ?8192;
      method = #post;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "Accept"; value = "application/json" },
      ];
      body = ?requestBody;
      transform = null;
      is_replicated = ?false;
    });

    if (response.status == 200) {
      HLib.extractContent(response.body);
    } else {
      "Lo siento, el servicio de Avi Bot no está disponible en este momento. Por favor, intenta de nuevo más tarde.";
    };
  };
};
