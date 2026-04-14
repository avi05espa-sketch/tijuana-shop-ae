import List "mo:core/List";
import Map "mo:core/Map";
import AuditTypes "types/audit";
import ChatTypes "types/chat";
import NTypes "types/notifications";
import OrderTypes "types/orders";
import PTypes "types/products";
import RatingTypes "types/ratings";
import ReportTypes "types/reports";
import SavedTypes "types/saved";
import UTypes "types/users";
import ActivityTypes "types/activity";
import ViewTypes "types/views";

import UsersApi "mixins/users-api";
import ProductsApi "mixins/products-api";
import RatingsApi "mixins/ratings-api";
import ReportsApi "mixins/reports-api";
import SavedApi "mixins/saved-api";
import StatsApi "mixins/stats-api";
import HttpOutcallsApi "mixins/http-outcalls-api";
import ConfigApi "mixins/config-api";
import AuditApi "mixins/audit-api";
import ActivityApi "mixins/activity-api";
import ChatApi "mixins/chat-api";
import OrdersApi "mixins/orders-api";
import ViewsApi "mixins/views-api";
import StripeApi "mixins/stripe-api";
import NotificationsApi "mixins/notifications-api";
import ConfigLib "lib/config";



actor {
  // User state
  let users = Map.empty<UTypes.UserId, UTypes.UserProfile>();
  let principalToId = Map.empty<Principal, UTypes.UserId>();

  // Product state
  let products = Map.empty<Text, PTypes.Product>();
  var seedDone = { var value = false };

  // Ratings state
  let ratings = List.empty<RatingTypes.Rating>();

  // Reports state
  let reports = List.empty<ReportTypes.Report>();

  // Saved state
  let saved = List.empty<SavedTypes.SavedProduct>();

  // Activity state
  let activityEvents = List.empty<ActivityTypes.ActivityEvent>();

  // Audit log state
  let auditLogs = List.empty<AuditTypes.AuditLog>();

  // Site config state
  let siteConfig = { var value = ConfigLib.defaultConfig() };

  // Chat state
  let conversations = Map.empty<ChatTypes.ConversationId, ChatTypes.Conversation>();
  let messages = List.empty<ChatTypes.Message>();

  // Orders state
  let orders = Map.empty<OrderTypes.OrderId, OrderTypes.Order>();

  // Product views state
  let productViews = List.empty<ViewTypes.ProductView>();

  // Notifications state
  let notifications = Map.empty<Text, NTypes.Notification>();

  // Include all domain mixins
  include UsersApi(users, principalToId, activityEvents, auditLogs);
  include ProductsApi(products, users, principalToId, seedDone, activityEvents, auditLogs, notifications);
  include RatingsApi(ratings, users, principalToId);
  include ReportsApi(reports, users, principalToId);
  include SavedApi(saved, users, principalToId);
  include StatsApi(users, principalToId, products, reports, orders, productViews);
  include HttpOutcallsApi();
  include ConfigApi(siteConfig, users, principalToId);
  include AuditApi(auditLogs, users, principalToId);
  include ActivityApi(activityEvents, users, principalToId);
  include ChatApi(conversations, messages, users, principalToId, notifications);
  include OrdersApi(orders, users, principalToId);
  include ViewsApi(productViews, principalToId);
  include StripeApi(products, users, principalToId);
  include NotificationsApi(notifications, users, principalToId);
};
