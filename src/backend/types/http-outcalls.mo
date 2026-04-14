module {
  public type ChatMessage = {
    role : Text;
    content : Text;
  };

  public type ChatRequest = {
    message : Text;
    conversationHistory : [ChatMessage];
  };

  public type ChatResponse = {
    reply : Text;
    success : Bool;
  };
};
