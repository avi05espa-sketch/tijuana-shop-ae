import Text "mo:core/Text";
import HTypes "../types/http-outcalls";

module {

  let SYSTEM_PROMPT : Text = "Eres Avi Bot, un asistente de IA útil para el marketplace Tijuana Shop AE. Responde siempre en español. Ayuda a los usuarios con búsqueda de productos, información de vendedores, preguntas sobre cuentas y políticas del marketplace.";

  // Minimal JSON string escaping
  func escapeJson(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      if (c == '\"') {
        result := result # "\\\"";
      } else if (c == '\\') {
        result := result # "\\\\";
      } else if (c == '\n') {
        result := result # "\\n";
      } else if (c == '\r') {
        result := result # "\\r";
      } else if (c == '\t') {
        result := result # "\\t";
      } else {
        result := result # Text.fromChar(c);
      };
    };
    result;
  };

  func messageToJson(msg : HTypes.ChatMessage) : Text {
    "{\"role\":\"" # escapeJson(msg.role) # "\",\"content\":\"" # escapeJson(msg.content) # "\"}";
  };

  // Build the full POST body for the OpenAI-compatible API
  public func buildRequestBody(message : Text, history : [HTypes.ChatMessage]) : Blob {
    let systemMsg = "{\"role\":\"system\",\"content\":\"" # escapeJson(SYSTEM_PROMPT) # "\"}";
    var parts = systemMsg;
    for (msg in history.vals()) {
      parts := parts # "," # messageToJson(msg);
    };
    parts := parts # ",{\"role\":\"user\",\"content\":\"" # escapeJson(message) # "\"}";
    let body = "{\"model\":\"openai\",\"messages\":[" # parts # "],\"max_tokens\":512}";
    body.encodeUtf8();
  };

  // Extract the assistant "content" field from an OpenAI-style JSON response body.
  // Scans for the first occurrence of "content":"  and reads until the closing unescaped quote.
  public func extractContent(responseBody : Blob) : Text {
    let text = switch (responseBody.decodeUtf8()) {
      case (?t) t;
      case null { return "Lo siento, no pude procesar la respuesta del servidor."; };
    };

    let textChars = text.toArray();
    let markerChars = ("\"content\":\"").toArray();
    let textSize = textChars.size();
    let markerSize = markerChars.size();

    // Find the marker position
    var startIdx = 0;
    var found = false;
    var i = 0;
    label search while (i + markerSize <= textSize) {
      var match = true;
      var j = 0;
      while (j < markerSize) {
        if (textChars[i + j] != markerChars[j]) {
          match := false;
        };
        j += 1;
      };
      if (match) {
        startIdx := i + markerSize;
        found := true;
        break search;
      };
      i += 1;
    };

    if (not found) {
      return "Lo siento, no pude obtener una respuesta. Por favor, intenta de nuevo.";
    };

    // Read until the next unescaped closing quote
    var reply = "";
    var k = startIdx;
    var escaped = false;
    label extract while (k < textSize) {
      let ch = textChars[k];
      if (escaped) {
        if (ch == 'n') { reply := reply # "\n"; }
        else if (ch == 't') { reply := reply # "\t"; }
        else if (ch == '\"') { reply := reply # "\""; }
        else if (ch == '\\') { reply := reply # "\\"; }
        else { reply := reply # Text.fromChar(ch); };
        escaped := false;
      } else if (ch == '\\') {
        escaped := true;
      } else if (ch == '\"') {
        break extract;
      } else {
        reply := reply # Text.fromChar(ch);
      };
      k += 1;
    };

    if (reply == "") {
      return "Lo siento, recibí una respuesta vacía. Por favor, intenta de nuevo.";
    };

    reply;
  };
};
