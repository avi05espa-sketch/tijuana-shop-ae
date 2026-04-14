import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    id: UserId;
    bio?: string;
    status: UserStatus;
    timezone: string;
    principal: Principal;
    verified: boolean;
    privacySearchable: boolean;
    dateOfBirth?: string;
    name: string;
    createdAt: Timestamp;
    role: UserRole;
    zone?: string;
    themePreference: string;
    email?: string;
    language: string;
    totalSales: bigint;
    avatarUrl?: string;
    currency: string;
    privacyShowHistory: boolean;
    frequentClients: Array<UserId>;
    phone: string;
    notificationsEmail: boolean;
    notificationsPush: boolean;
    avgRating: number;
}
export type AssetId = string;
export type Timestamp = bigint;
export interface Rating {
    id: string;
    toSellerId: UserId;
    createdAt: Timestamp;
    productId: string;
    score: bigint;
    comment: string;
    fromUserId: UserId;
}
export interface AuditLog {
    id: string;
    status: string;
    action: string;
    adminName: string;
    timestamp: Timestamp;
    details: string;
    affectedId?: string;
    adminId: UserId;
}
export interface SiteConfig {
    metaDescription: string;
    analyticsId: string;
    maintenanceMode: boolean;
    siteName: string;
    logoUrl: string;
    siteDescription: string;
    contactEmail: string;
}
export interface Report {
    id: string;
    status: ReportStatus;
    createdAt: Timestamp;
    description: string;
    adminNote?: string;
    reportType: ReportType;
    reporterId: UserId;
    entityId: string;
    reason: string;
}
export interface RevenueByDay {
    revenue: bigint;
    date: string;
}
export interface TopProduct {
    title: string;
    revenue: bigint;
    views: bigint;
    orders: bigint;
    productId: string;
}
export type ConversationId = string;
export interface ActivityEvent {
    id: string;
    userId: UserId;
    description: string;
    timestamp: Timestamp;
    relatedId?: string;
    eventType: string;
}
export interface ProductFilters {
    status?: ProductStatus;
    zone?: ProductZone;
    searchTerm?: string;
    category?: ProductCategory;
    priceMax?: number;
    priceMin?: number;
    condition?: ProductCondition;
}
export interface ChatMessage {
    content: string;
    role: string;
}
export interface SellerStats {
    totalOrders: bigint;
    revenueByDay: Array<RevenueByDay>;
    conversionRate: number;
    topProducts: Array<TopProduct>;
    totalRevenue: bigint;
    avgOrderValue: bigint;
}
export interface AuditFilters {
    page: bigint;
    pageSize: bigint;
    actionType?: string;
    toDate?: Timestamp;
    fromDate?: Timestamp;
    adminId?: UserId;
}
export interface Order {
    id: OrderId;
    status: OrderStatus;
    createdAt: Timestamp;
    productId: string;
    updatedAt: Timestamp;
    buyerId: UserId;
    stripePaymentIntentId: string;
    amountMxn: bigint;
    sellerId: UserId;
}
export interface DashboardStats {
    totalProducts: bigint;
    newUsersToday: bigint;
    pendingReports: bigint;
    activeListings: bigint;
    totalReports: bigint;
    blockedProducts: bigint;
    totalUsers: bigint;
    newProductsToday: bigint;
}
export type UserId = string;
export interface OrderStats {
    totalOrders: bigint;
    ordersThisMonth: bigint;
    ordersThisWeek: bigint;
    ordersToday: bigint;
    totalRevenue: bigint;
}
export type MessageId = string;
export interface Notification {
    id: string;
    title: string;
    body: string;
    userId: UserId;
    notificationType: NotificationType;
    createdAt: Timestamp;
    isRead: boolean;
    relatedId?: string;
}
export interface SavedProduct {
    userId: UserId;
    productId: string;
    savedAt: Timestamp;
}
export interface UserSettings {
    timezone: string;
    privacySearchable: boolean;
    themePreference: string;
    language: string;
    currency: string;
    privacyShowHistory: boolean;
    notificationsEmail: boolean;
    notificationsPush: boolean;
}
export interface Message {
    id: MessageId;
    authorId: UserId;
    text: string;
    readBySeller: boolean;
    conversationId: ConversationId;
    timestamp: Timestamp;
    readByBuyer: boolean;
}
export interface Conversation {
    id: ConversationId;
    status: ConversationStatus;
    lastMessageAt: Timestamp;
    createdAt: Timestamp;
    productId: string;
    buyerId: UserId;
    sellerId: UserId;
}
export interface Product {
    id: string;
    status: ProductStatus;
    title: string;
    isApartado: boolean;
    featured: boolean;
    views: bigint;
    createdAt: Timestamp;
    zone: ProductZone;
    description: string;
    whatsappContact?: string;
    category: ProductCategory;
    sellerId: UserId;
    colony: string;
    price: number;
    photos: Array<AssetId>;
    negotiable: boolean;
    condition: ProductCondition;
}
export type OrderId = string;
export enum ConversationStatus {
    active = "active",
    archived = "archived"
}
export enum NotificationType {
    newProduct = "newProduct",
    newMessage = "newMessage",
    productUpdate = "productUpdate"
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed",
    refunded = "refunded",
    failed = "failed"
}
export enum ProductCategory {
    mueble = "mueble",
    auto = "auto",
    otro = "otro",
    ropa = "ropa",
    electronico = "electronico"
}
export enum ProductCondition {
    nuevo = "nuevo",
    usado = "usado"
}
export enum ProductStatus {
    active = "active",
    blocked = "blocked",
    hidden = "hidden",
    paused = "paused"
}
export enum ProductZone {
    centro = "centro",
    playas = "playas",
    otay = "otay",
    corredor2000 = "corredor2000"
}
export enum ReportStatus {
    new_ = "new",
    resolved = "resolved",
    inReview = "inReview"
}
export enum ReportType {
    chat = "chat",
    user = "user",
    product = "product"
}
export enum UserRole {
    admin = "admin",
    vendedor = "vendedor",
    comprador = "comprador"
}
export enum UserStatus {
    active = "active",
    banned = "banned",
    suspended = "suspended"
}
export interface backendInterface {
    addAdminNote(reportId: string, note: string): Promise<Report>;
    addFrequentClient(sellerId: UserId): Promise<UserProfile>;
    addRating(toSellerId: UserId, productId: string, score: bigint, comment: string): Promise<Rating>;
    chatWithAviBot(message: string, conversationHistory: Array<ChatMessage>): Promise<string>;
    createCheckoutSession(productId: string, successUrl: string, cancelUrl: string): Promise<{
        checkoutUrl: string;
    }>;
    createConversation(sellerId: UserId, productId: string): Promise<Conversation>;
    createOrder(productId: string, sellerId: UserId, amountMxn: bigint, stripePaymentIntentId: string): Promise<Order>;
    createProduct(title: string, description: string, price: number, negotiable: boolean, category: ProductCategory, condition: ProductCondition, zone: ProductZone, colony: string, photos: Array<string>, whatsappContact: string | null, isApartado: boolean): Promise<Product>;
    createReport(reportType: ReportType, entityId: string, reason: string, description: string): Promise<Report>;
    deleteProduct(productId: string): Promise<void>;
    deleteUser(targetId: UserId): Promise<void>;
    featureProduct(productId: string, featured: boolean): Promise<Product>;
    getActivityByUser(userId: UserId): Promise<Array<ActivityEvent>>;
    getConfig(): Promise<SiteConfig>;
    getConversationMessages(conversationId: ConversationId): Promise<Array<Message>>;
    getDashboardStats(): Promise<DashboardStats>;
    getMyActivity(): Promise<Array<ActivityEvent>>;
    getMyConversations(): Promise<Array<Conversation>>;
    getMyNotifications(): Promise<Array<Notification>>;
    getMyOrders(): Promise<Array<Order>>;
    getMyProfile(): Promise<UserProfile | null>;
    getMyRatings(): Promise<Array<Rating>>;
    getMySavedProducts(): Promise<Array<SavedProduct>>;
    getMySellerOrders(): Promise<Array<Order>>;
    getProduct(productId: string): Promise<Product | null>;
    getProductPhotoIds(productId: string): Promise<Array<string>>;
    getProductViewCount(productId: string): Promise<bigint>;
    getProductsByVendor(sellerId: UserId): Promise<Array<Product>>;
    getRatingsBySeller(sellerId: UserId): Promise<Array<Rating>>;
    getSellerOrderStats(): Promise<OrderStats>;
    getSellerStats(): Promise<SellerStats>;
    getUnreadCount(): Promise<bigint>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserById(userId: UserId): Promise<UserProfile | null>;
    incrementProductViews(productId: string): Promise<void>;
    isMaintenanceMode(): Promise<boolean>;
    listAuditLogs(filters: AuditFilters): Promise<Array<AuditLog>>;
    listMyActivity(): Promise<Array<ActivityEvent>>;
    listProducts(filters: ProductFilters): Promise<Array<Product>>;
    listReports(): Promise<Array<Report>>;
    listUsers(): Promise<Array<UserProfile>>;
    markAllNotificationsRead(): Promise<void>;
    markConversationAsRead(conversationId: ConversationId): Promise<void>;
    markNotificationRead(notifId: string): Promise<void>;
    registerUser(name: string, phone: string, email: string | null, avatarUrl: string | null, bio: string | null, zone: string | null, role: UserRole): Promise<UserProfile>;
    removeFrequentClient(sellerId: UserId): Promise<UserProfile>;
    saveProduct(productId: string): Promise<SavedProduct>;
    seedSampleData(): Promise<bigint>;
    sendMessage(conversationId: ConversationId, text: string): Promise<Message>;
    trackProductView(productId: string): Promise<void>;
    unsaveProduct(productId: string): Promise<void>;
    updateConfig(siteName: string | null, siteDescription: string | null, logoUrl: string | null, contactEmail: string | null, maintenanceMode: boolean | null, analyticsId: string | null, metaDescription: string | null): Promise<SiteConfig>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<Order>;
    updateProduct(productId: string, title: string | null, description: string | null, price: number | null, negotiable: boolean | null, category: ProductCategory | null, condition: ProductCondition | null, zone: ProductZone | null, colony: string | null, photos: Array<string> | null, whatsappContact: string | null, isApartado: boolean | null): Promise<Product>;
    updateProductStatus(productId: string, status: ProductStatus): Promise<Product>;
    updateProfile(name: string | null, email: string | null, avatarUrl: string | null, bio: string | null, zone: string | null, dateOfBirth: string | null, privacySearchable: boolean | null, privacyShowHistory: boolean | null, themePreference: string | null, language: string | null, timezone: string | null, currency: string | null, notificationsEmail: boolean | null, notificationsPush: boolean | null): Promise<UserProfile>;
    updateReportStatus(reportId: string, status: ReportStatus): Promise<Report>;
    updateSettings(settings: UserSettings): Promise<UserProfile>;
    updateUserStatus(targetId: UserId, status: UserStatus): Promise<UserProfile>;
    verifyUser(targetId: UserId): Promise<UserProfile>;
}
