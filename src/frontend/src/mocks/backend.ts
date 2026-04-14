import type { backendInterface } from "../backend";
import {
  ConversationStatus,
  OrderStatus,
  ProductCategory,
  ProductCondition,
  ProductStatus,
  ProductZone,
  ReportStatus,
  ReportType,
  UserRole,
  UserStatus,
} from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);

const sampleUser = {
  id: "user-1",
  name: "Carlos Mendoza",
  phone: "+52-664-123-4567",
  email: "carlos@example.com",
  status: UserStatus.active,
  principal: { toText: () => "aaaaa-aa" } as any,
  verified: true,
  createdAt: now,
  role: UserRole.vendedor,
  zone: "playas",
  totalSales: BigInt(12),
  avgRating: 4.5,
  avatarUrl: "https://i.pravatar.cc/150?img=1",
  bio: "Vendedor verificado en Tijuana",
  timezone: "America/Tijuana",
  privacySearchable: true,
  themePreference: "dark",
  language: "es",
  currency: "MXN",
  privacyShowHistory: true,
  notificationsEmail: false,
  notificationsPush: true,
  frequentClients: [] as string[],
};

const adminUser = {
  ...sampleUser,
  id: "admin-1",
  name: "Admin TJ",
  role: UserRole.admin,
};

const sampleProducts = [
  {
    id: "prod-1",
    title: "Laptop Dell XPS 15",
    description: "Excelente estado, 16GB RAM, i7",
    price: 12000,
    negotiable: true,
    category: ProductCategory.electronico,
    condition: ProductCondition.usado,
    zone: ProductZone.playas,
    colony: "Playas de Tijuana",
    photos: ["https://picsum.photos/seed/laptop/400/300"],
    status: ProductStatus.active,
    featured: true,
    views: BigInt(145),
    createdAt: now,
    sellerId: "user-1",
    isApartado: false,
    whatsappContact: "+526641234567",
  },
  {
    id: "prod-2",
    title: "Audífonos Sony WH-1000XM4",
    description: "Nuevos en caja, cancelación de ruido",
    price: 3500,
    negotiable: false,
    category: ProductCategory.electronico,
    condition: ProductCondition.nuevo,
    zone: ProductZone.otay,
    colony: "Otay Universidad",
    photos: ["https://picsum.photos/seed/headphones/400/300"],
    status: ProductStatus.active,
    featured: false,
    views: BigInt(89),
    createdAt: now,
    sellerId: "user-1",
    isApartado: false,
    whatsappContact: "+526641234567",
  },
  {
    id: "prod-3",
    title: "iPhone 14 Pro Max",
    description: "256GB, Space Black, con caja original",
    price: 18000,
    negotiable: true,
    category: ProductCategory.electronico,
    condition: ProductCondition.usado,
    zone: ProductZone.centro,
    colony: "Centro Histórico",
    photos: ["https://picsum.photos/seed/iphone/400/300"],
    status: ProductStatus.active,
    featured: false,
    views: BigInt(230),
    createdAt: now,
    sellerId: "user-1",
    isApartado: false,
    whatsappContact: "+526641234567",
  },
  {
    id: "prod-4",
    title: "Sillón Reclinable Cuero",
    description: "Muy buen estado, color café",
    price: 2800,
    negotiable: true,
    category: ProductCategory.mueble,
    condition: ProductCondition.usado,
    zone: ProductZone.corredor2000,
    colony: "Corredor 2000",
    photos: ["https://picsum.photos/seed/sofa/400/300"],
    status: ProductStatus.active,
    featured: false,
    views: BigInt(55),
    createdAt: now,
    sellerId: "user-1",
    isApartado: false,
    whatsappContact: "+526641234567",
  },
  {
    id: "prod-5",
    title: "Bicicleta MTB Trek",
    description: "Rodada 29, excelente estado, poco uso",
    price: 6500,
    negotiable: false,
    category: ProductCategory.otro,
    condition: ProductCondition.usado,
    zone: ProductZone.playas,
    colony: "Playas de Tijuana",
    photos: ["https://picsum.photos/seed/bike/400/300"],
    status: ProductStatus.active,
    featured: false,
    views: BigInt(78),
    createdAt: now,
    sellerId: "user-1",
    isApartado: false,
    whatsappContact: "+526641234567",
  },
  {
    id: "prod-6",
    title: "Vestido Zara Nuevo",
    description: "Talla M, colores vivos, nunca usado",
    price: 450,
    negotiable: false,
    category: ProductCategory.ropa,
    condition: ProductCondition.nuevo,
    zone: ProductZone.centro,
    colony: "Zona Río",
    photos: ["https://picsum.photos/seed/dress/400/300"],
    status: ProductStatus.active,
    featured: false,
    views: BigInt(34),
    createdAt: now,
    sellerId: "user-1",
    isApartado: false,
    whatsappContact: "+526641234567",
  },
];

const sampleReports = [
  {
    id: "report-1",
    reportType: ReportType.product,
    entityId: "prod-1",
    reason: "Precio sospechoso",
    description: "El precio parece muy bajo para el producto descrito",
    status: ReportStatus.new_,
    reporterId: "user-2",
    createdAt: now,
  },
  {
    id: "report-2",
    reportType: ReportType.user,
    entityId: "user-3",
    reason: "Comportamiento inapropiado",
    description: "Mensajes ofensivos en el chat",
    status: ReportStatus.inReview,
    reporterId: "user-1",
    createdAt: now,
  },
];

export const mockBackend: backendInterface = {
  addAdminNote: async (reportId, note) => ({
    ...sampleReports[0],
    id: reportId,
    adminNote: note,
  }),

  addRating: async (toSellerId, productId, score, comment) => ({
    id: "rating-1",
    toSellerId,
    productId,
    score,
    comment,
    fromUserId: "user-1",
    createdAt: now,
  }),

  createProduct: async (
    title,
    description,
    price,
    negotiable,
    category,
    condition,
    zone,
    colony,
    photos,
    whatsappContact,
    isApartado
  ) => ({
    id: "new-prod",
    title,
    description,
    price,
    negotiable,
    category,
    condition,
    zone,
    colony,
    photos,
    whatsappContact: whatsappContact ?? undefined,
    isApartado: isApartado ?? false,
    status: ProductStatus.active,
    featured: false,
    views: BigInt(0),
    createdAt: now,
    sellerId: "user-1",
  }),

  createReport: async (reportType, entityId, reason, description) => ({
    id: "new-report",
    reportType,
    entityId,
    reason,
    description,
    status: ReportStatus.new_,
    reporterId: "user-1",
    createdAt: now,
  }),

  deleteProduct: async () => undefined,

  deleteUser: async () => undefined,

  featureProduct: async (productId, featured) => ({
    ...sampleProducts[0],
    id: productId,
    featured,
  }),

  getDashboardStats: async () => ({
    totalProducts: BigInt(247),
    newUsersToday: BigInt(14),
    pendingReports: BigInt(3),
    activeListings: BigInt(189),
    totalReports: BigInt(28),
    blockedProducts: BigInt(5),
    totalUsers: BigInt(1423),
    newProductsToday: BigInt(31),
  }),

  getMyProfile: async () => sampleUser,

  getMyRatings: async () => [
    {
      id: "rating-1",
      toSellerId: "user-1",
      productId: "prod-1",
      score: BigInt(5),
      comment: "Excelente vendedor, producto tal como descrito",
      fromUserId: "user-2",
      createdAt: now,
    },
  ],

  getMySavedProducts: async () => [
    {
      userId: "user-1",
      productId: "prod-2",
      savedAt: now,
    },
  ],

  getProduct: async (productId) =>
    sampleProducts.find((p) => p.id === productId) || sampleProducts[0],

  getProductPhotoIds: async (productId) =>
    sampleProducts.find((p) => p.id === productId)?.photos ?? [],

  getProductsByVendor: async () => sampleProducts.slice(0, 3),

  getRatingsBySeller: async () => [
    {
      id: "rating-1",
      toSellerId: "user-1",
      productId: "prod-1",
      score: BigInt(5),
      comment: "Excelente producto",
      fromUserId: "user-2",
      createdAt: now,
    },
  ],

  getUserById: async () => sampleUser,

  incrementProductViews: async () => undefined,

  listProducts: async () => sampleProducts,

  listReports: async () => sampleReports,

  listUsers: async () => [
    sampleUser,
    {
      ...sampleUser,
      id: "user-2",
      name: "María García",
      email: "maria@example.com",
      phone: "+52-664-987-6543",
      role: UserRole.comprador,
      totalSales: BigInt(0),
      avgRating: 0,
      avatarUrl: "https://i.pravatar.cc/150?img=2",
    },
    adminUser,
  ],

  registerUser: async (name, phone, email, avatarUrl, bio, zone) => ({
    ...sampleUser,
    name,
    phone,
    email: email || undefined,
    avatarUrl: avatarUrl || undefined,
    bio: bio || undefined,
    zone: zone || undefined,
  }),

  saveProduct: async (productId) => ({
    userId: "user-1",
    productId,
    savedAt: now,
  }),

  seedSampleData: async () => BigInt(12),

  unsaveProduct: async () => undefined,

  updateProduct: async (productId) => ({
    ...sampleProducts[0],
    id: productId,
  }),

  updateProductStatus: async (productId, status) => ({
    ...sampleProducts[0],
    id: productId,
    status,
  }),

  updateProfile: async () => sampleUser,

  updateReportStatus: async (reportId, status) => ({
    ...sampleReports[0],
    id: reportId,
    status,
  }),

  updateUserStatus: async (targetId, status) => ({
    ...sampleUser,
    id: targetId,
    status,
  }),

  verifyUser: async (targetId) => ({
    ...sampleUser,
    id: targetId,
    verified: true,
  }),

  chatWithAviBot: async (message: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return `Hola, soy Avi Bot. Recibí tu mensaje: "${message}". Por favor visita nuestra sección de ayuda para más información.`;
  },

  updateSettings: async () => sampleUser,

  getMyActivity: async () => [
    {
      id: "act-1",
      userId: "user-1",
      eventType: "register",
      description: "Cuenta creada exitosamente.",
      timestamp: now,
    },
    {
      id: "act-2",
      userId: "user-1",
      eventType: "product_publish",
      description: "Publicaste el producto: Laptop Dell XPS 15.",
      timestamp: now - BigInt(3_600_000_000_000),
    },
    {
      id: "act-3",
      userId: "user-1",
      eventType: "profile_update",
      description: "Actualizaste tu perfil.",
      timestamp: now - BigInt(7_200_000_000_000),
    },
  ],

  listMyActivity: async () => [],

  listAuditLogs: async () => [],

  getActivityByUser: async () => [],

  getConfig: async () => ({
    siteName: "Tijuana Shop AE",
    siteDescription: "Marketplace local de Tijuana",
    metaDescription: "Compra y vende en Tijuana",
    logoUrl: "",
    contactEmail: "soporte@tijuanashopae.com",
    maintenanceMode: false,
    analyticsId: "",
  }),

  isMaintenanceMode: async () => false,

  updateConfig: async () => ({
    siteName: "Tijuana Shop AE",
    siteDescription: "Marketplace local de Tijuana",
    metaDescription: "Compra y vende en Tijuana",
    logoUrl: "",
    contactEmail: "soporte@tijuanashopae.com",
    maintenanceMode: false,
    analyticsId: "",
  }),

  // ─── Conversations / Chat ───────────────────────────────────────────────────
  getMyConversations: async () => [
    {
      id: "conv-1",
      buyerId: "user-2",
      sellerId: "user-1",
      productId: "prod-1",
      status: ConversationStatus.active,
      createdAt: now,
      lastMessageAt: now,
    },
  ],

  createConversation: async (sellerId, productId) => ({
    id: "conv-new",
    buyerId: "user-2",
    sellerId,
    productId,
    status: ConversationStatus.active,
    createdAt: now,
    lastMessageAt: BigInt(0),
  }),

  getConversationMessages: async () => [
    {
      id: "msg-1",
      conversationId: "conv-1",
      authorId: "user-2",
      text: "Hola, ¿sigue disponible?",
      timestamp: now - BigInt(3_600_000_000_000),
      readByBuyer: true,
      readBySeller: false,
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      authorId: "user-1",
      text: "¡Sí, claro! ¿Cuándo puedes verlo?",
      timestamp: now,
      readByBuyer: false,
      readBySeller: true,
    },
  ],

  sendMessage: async (conversationId, text) => ({
    id: "msg-new",
    conversationId,
    authorId: "user-1",
    text,
    timestamp: BigInt(Date.now()) * BigInt(1_000_000),
    readByBuyer: false,
    readBySeller: true,
  }),

  getUnreadCount: async () => BigInt(2),

  markConversationAsRead: async () => undefined,

  // ─── Orders ─────────────────────────────────────────────────────────────────
  createOrder: async (productId, sellerId, amountMxn, stripePaymentIntentId) => ({
    id: "order-new",
    productId,
    sellerId,
    buyerId: "user-2",
    amountMxn,
    stripePaymentIntentId,
    status: OrderStatus.pending,
    createdAt: now,
    updatedAt: now,
  }),

  getMyOrders: async () => [
    {
      id: "order-1",
      productId: "prod-1",
      sellerId: "user-1",
      buyerId: "user-2",
      amountMxn: BigInt(12000),
      stripePaymentIntentId: "pi_test_abc123",
      status: OrderStatus.completed,
      createdAt: now - BigInt(86_400_000_000_000),
      updatedAt: now,
    },
  ],

  getMySellerOrders: async () => [
    {
      id: "order-2",
      productId: "prod-2",
      sellerId: "user-1",
      buyerId: "user-3",
      amountMxn: BigInt(3500),
      stripePaymentIntentId: "pi_test_xyz789",
      status: OrderStatus.pending,
      createdAt: now - BigInt(3_600_000_000_000),
      updatedAt: now,
    },
  ],

  updateOrderStatus: async (orderId, status) => ({
    id: orderId,
    productId: "prod-1",
    sellerId: "user-1",
    buyerId: "user-2",
    amountMxn: BigInt(12000),
    stripePaymentIntentId: "pi_test_abc123",
    status,
    createdAt: now,
    updatedAt: now,
  }),

  getSellerOrderStats: async () => ({
    totalOrders: BigInt(47),
    totalRevenue: BigInt(285000),
    ordersToday: BigInt(3),
    ordersThisWeek: BigInt(12),
    ordersThisMonth: BigInt(34),
  }),

  getSellerStats: async () => ({
    totalRevenue: BigInt(285000),
    totalOrders: BigInt(47),
    avgOrderValue: BigInt(6063),
    conversionRate: 0.043,
    topProducts: [
      {
        productId: "prod-1",
        title: "Laptop Dell XPS 15",
        views: BigInt(145),
        orders: BigInt(8),
        revenue: BigInt(96000),
      },
      {
        productId: "prod-3",
        title: "iPhone 14 Pro Max",
        views: BigInt(230),
        orders: BigInt(15),
        revenue: BigInt(270000),
      },
    ],
    revenueByDay: [
      { date: "2026-04-06", revenue: BigInt(12000) },
      { date: "2026-04-07", revenue: BigInt(18000) },
      { date: "2026-04-08", revenue: BigInt(9500) },
      { date: "2026-04-09", revenue: BigInt(22000) },
      { date: "2026-04-10", revenue: BigInt(15000) },
      { date: "2026-04-11", revenue: BigInt(28500) },
      { date: "2026-04-12", revenue: BigInt(34000) },
    ],
  }),

  // ─── Product Tracking ───────────────────────────────────────────────────────
  trackProductView: async () => undefined,

  getProductViewCount: async () => BigInt(145),

  // ─── Checkout ───────────────────────────────────────────────────────────────
  createCheckoutSession: async (_productId, successUrl) => ({
    checkoutUrl: successUrl,
  }),

  // ─── Frequent Clients ────────────────────────────────────────────────────────
  addFrequentClient: async () => sampleUser,
  removeFrequentClient: async () => sampleUser,

  // ─── Notifications ───────────────────────────────────────────────────────────
  getMyNotifications: async () => [],
  getUnreadNotificationCount: async () => BigInt(0),
  markNotificationRead: async () => undefined,
  markAllNotificationsRead: async () => undefined,
};
