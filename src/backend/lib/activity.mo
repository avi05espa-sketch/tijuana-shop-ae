import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/activity";

module {
  public type ActivityEvent = Types.ActivityEvent;
  public type UserId = Types.UserId;

  func nextId(events : List.List<ActivityEvent>) : Text {
    "evt-" # events.size().toText() # "-" # Time.now().toText();
  };

  public func addEvent(
    events : List.List<ActivityEvent>,
    userId : UserId,
    eventType : Text,
    description : Text,
    relatedId : ?Text,
  ) : ActivityEvent {
    let event : ActivityEvent = {
      id = nextId(events);
      userId = userId;
      eventType = eventType;
      description = description;
      timestamp = Time.now();
      relatedId = relatedId;
    };
    events.add(event);
    event;
  };

  public func getMyActivity(
    events : List.List<ActivityEvent>,
    userId : UserId,
  ) : [ActivityEvent] {
    let filtered = events.filter(func(e : ActivityEvent) : Bool { e.userId == userId });
    let all = filtered.toArray();
    // Return last 100 events (most recent)
    let size = all.size();
    if (size <= 100) {
      all;
    } else {
      all.sliceToArray(size - 100, size);
    };
  };

  public func getActivityByUser(
    events : List.List<ActivityEvent>,
    userId : UserId,
  ) : [ActivityEvent] {
    getMyActivity(events, userId);
  };
};
