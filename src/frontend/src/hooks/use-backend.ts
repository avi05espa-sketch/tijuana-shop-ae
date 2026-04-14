import { loadConfig, useActor } from "@caffeineai/core-infrastructure";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import type {
  ActivityEvent,
  AuditFilters,
  AuditLog,
  Conversation,
  DashboardStats,
  Message,
  Order,
  OrderStats,
  Product,
  ProductFilters,
  SellerStats,
  SiteConfig,
  UserProfile,
  UserSettings,
} from "../backend";
import { OrderStatus, UserRole } from "../backend";

function useActorInstance() {
  return useActor(createActor);
}

// ─── Storage Client Hook ──────────────────────────────────────────────────────
export function useStorageClient(): StorageClient | null {
  const { identity } = useInternetIdentity();
  const [client, setClient] = useState<StorageClient | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    loadConfig()
      .then((config) => {
        const agent = new HttpAgent({
          host: config.backend_host,
          identity: identity ?? undefined,
        });

        if (config.backend_host?.includes("localhost")) {
          agent.fetchRootKey().catch(() => {});
        }

        const storageClient = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );
        setClient(storageClient);
      })
      .catch((err) => {
        console.error("Failed to init StorageClient:", err);
      });
  }, [identity]);

  return client;
}

export function useCurrentUser() {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false,
    staleTime: 30_000,
  });

  const user = query.data ?? null;
  return {
    user,
    isLoading: isFetching || query.isLoading,
    isFetched: !!identity && query.isFetched,
    isAdmin: user?.role === UserRole.admin,
    isVendor: user?.role === UserRole.vendedor || user?.role === UserRole.admin,
    isAuthenticated: !!identity,
  };
}

export function useProducts(filters: ProductFilters = {}) {
  const { actor, isFetching } = useActorInstance();

  return useQuery<Product[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts(filters);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProduct(id: string) {
  const { actor, isFetching } = useActorInstance();

  return useQuery<Product | null>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useProductsByVendor(sellerId: string) {
  const { actor, isFetching } = useActorInstance();

  return useQuery<Product[]>({
    queryKey: ["vendorProducts", sellerId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsByVendor(sellerId);
    },
    enabled: !!actor && !isFetching && !!sellerId,
  });
}

export function useDashboardStats() {
  const { actor, isFetching } = useActorInstance();

  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor no disponible");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVendorProfile(userId: string) {
  const { actor, isFetching } = useActorInstance();

  return useQuery<UserProfile | null>({
    queryKey: ["vendorProfile", userId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserById(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useSavedProducts() {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["savedProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySavedProducts();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSaveProduct() {
  const { actor } = useActorInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("No autenticado");
      return actor.saveProduct(productId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["savedProducts"] }),
  });
}

export function useUnsaveProduct() {
  const { actor } = useActorInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("No autenticado");
      return actor.unsaveProduct(productId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["savedProducts"] }),
  });
}

export function useRegisterUser() {
  const { actor } = useActorInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      email?: string;
      avatarUrl?: string;
      bio?: string;
      zone?: string;
      role?: UserRole;
    }) => {
      if (!actor) throw new Error("No autenticado");
      return actor.registerUser(
        data.name,
        data.phone,
        data.email ?? null,
        data.avatarUrl ?? null,
        data.bio ?? null,
        data.zone ?? null,
        data.role ?? UserRole.comprador,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
  });
}

export function useListUsers() {
  const { actor, isFetching } = useActorInstance();

  return useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActorRef() {
  return useActorInstance();
}

// ─── Admin: Site Config ───────────────────────────────────────────────────────

export function useSiteConfig() {
  const { actor, isFetching } = useActorInstance();

  return useQuery<SiteConfig>({
    queryKey: ["siteConfig"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor no disponible");
      return actor.getConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin: Audit Logs ────────────────────────────────────────────────────────

export function useAuditLogs(filters?: Partial<AuditFilters>) {
  const { actor, isFetching } = useActorInstance();

  return useQuery<AuditLog[]>({
    queryKey: ["auditLogs", filters],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAuditLogs({
        page: filters?.page ?? BigInt(0),
        pageSize: filters?.pageSize ?? BigInt(500),
        actionType: filters?.actionType,
        fromDate: filters?.fromDate,
        toDate: filters?.toDate,
        adminId: filters?.adminId,
      });
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function useUpdateSettings() {
  const { actor } = useActorInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UserSettings) => {
      if (!actor) throw new Error("No autenticado");
      return actor.updateSettings(settings);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
  });
}

// ─── Activity ──────────────────────────────────────────────────────────────────

export function useMyActivity() {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  return useQuery<ActivityEvent[]>({
    queryKey: ["myActivity"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyActivity();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// ─── Seller Stats ─────────────────────────────────────────────────────────────

export function useGetSellerStats() {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  return useQuery<SellerStats>({
    queryKey: ["sellerStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor no disponible");
      return actor.getSellerStats();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetSellerOrderStats() {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  return useQuery<OrderStats>({
    queryKey: ["sellerOrderStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor no disponible");
      return actor.getSellerOrderStats();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// ─── Avi Bot ────────────────────────────────────────────────────────────────

const BOT_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["hola", "buenas", "buenos", "hey", "hi", "saludos"],
    response:
      "¡Hola! 👋 ¿En qué puedo ayudarte hoy? Puedo orientarte sobre cómo comprar, vender o navegar en Tijuana Shop AE.",
  },
  {
    keywords: ["vender", "publicar", "producto", "anuncio", "subir"],
    response:
      "Para vender en Tijuana Shop AE, registrate como vendedor y luego ve a 'Publicar Producto'. Puedes agregar fotos, descripcion, precio y zona de Tijuana. Es muy facil! 🛍️",
  },
  {
    keywords: ["comprar", "buscar", "encontrar", "producto"],
    response:
      "Puedes explorar todos los productos disponibles en la sección de tienda. Usa los filtros por categoría, zona y precio para encontrar lo que buscas más rápido. 🔍",
  },
  {
    keywords: ["precio", "costo", "cuánto", "cuanto"],
    response:
      "Los precios los define cada vendedor en MXN (pesos mexicanos). Muchos productos son negociables, así que puedes intentar llegar a un acuerdo con el vendedor. 💰",
  },
  {
    keywords: ["zona", "colonia", "lugar", "dónde", "donde", "ubicación"],
    response:
      "Tijuana Shop AE organiza los productos por zonas: Centro, Playas, Otay y Corredor 2000. Así encuentras vendedores cerca de ti. 📍",
  },
  {
    keywords: ["registro", "registrar", "cuenta", "crear"],
    response:
      "Para registrarte necesitas: nombre, teléfono y verificar que estás en Tijuana. El registro es gratuito y rápido. ¡Bienvenido a la comunidad! 🎉",
  },
  {
    keywords: ["seguro", "seguridad", "estafa", "fraude", "confiable"],
    response:
      "Tu seguridad es nuestra prioridad. Verificamos a los usuarios con teléfono y ubicación. Si ves algo sospechoso, usa el botón de reportar. También evita pagar sin ver el producto. 🛡️",
  },
  {
    keywords: ["pago", "transferencia", "efectivo", "tarjeta"],
    response:
      "Los pagos actualmente se coordinan directamente entre comprador y vendedor. Recomendamos transacciones en persona y en lugares públicos de Tijuana. 💳",
  },
  {
    keywords: ["contactar", "vendedor", "hablar", "chat", "mensaje"],
    response:
      "Puedes contactar al vendedor desde la página del producto. Próximamente tendremos chat en tiempo real para mayor comodidad. 📬",
  },
  {
    keywords: ["reporte", "reportar", "problema", "queja"],
    response:
      "Si tienes algún problema, puedes reportar usuarios o productos usando el botón de reporte. Nuestro equipo revisará tu caso a la brevedad. 🚩",
  },
  {
    keywords: ["gracias", "thank", "perfecto", "excelente", "genial"],
    response:
      "¡De nada! 😊 Si tienes más preguntas, aquí estaré. ¡Buena suerte en tus compras o ventas en Tijuana Shop AE!",
  },
  {
    keywords: ["adios", "adiós", "bye", "hasta", "chao", "chau"],
    response:
      "¡Hasta luego! 👋 Fue un placer ayudarte. ¡Vuelve cuando quieras!",
  },
  {
    keywords: ["tijuana", "ciudad", "local"],
    response:
      "Tijuana Shop AE es 100% local. Todos los productos y vendedores son de Tijuana, BC. ¡Apoyamos el comercio local! 🇲🇽",
  },
  {
    keywords: [
      "categoria",
      "categoría",
      "tipo",
      "electrónico",
      "mueble",
      "ropa",
      "auto",
    ],
    response:
      "Tenemos categorías de: Electrónicos 📱, Muebles 🛋️, Ropa 👕, Autos 🚗 y Otros. Puedes filtrar por categoría para encontrar exactamente lo que necesitas.",
  },
  {
    keywords: ["calificación", "calificacion", "estrella", "reseña", "opinion"],
    response:
      "Los vendedores tienen calificaciones de 1 a 5 estrellas basadas en opiniones de compradores. Revisa siempre la calificación antes de comprar. ⭐",
  },
];

function generateBotResponse(message: string): string {
  const lowerMsg = message.toLowerCase();

  for (const entry of BOT_RESPONSES) {
    if (entry.keywords.some((kw) => lowerMsg.includes(kw))) {
      return entry.response;
    }
  }

  return "Entiendo tu consulta. Para asistirte mejor, te recomiendo visitar nuestra sección de ayuda o contactar al soporte de Tijuana Shop AE. ¿Hay algo más en lo que pueda ayudarte? 🤔";
}

// ─── Checkout & Orders ────────────────────────────────────────────────────────

export function useCreateCheckoutSession() {
  const { actor } = useActorInstance();

  return useMutation({
    mutationFn: async ({
      productId,
      successUrl,
      cancelUrl,
    }: {
      productId: string;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("No autenticado");
      return actor.createCheckoutSession(productId, successUrl, cancelUrl);
    },
  });
}

export function useCreateOrder() {
  const { actor } = useActorInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      sellerId,
      amountMxn,
      stripePaymentIntentId,
    }: {
      productId: string;
      sellerId: string;
      amountMxn: bigint;
      stripePaymentIntentId: string;
    }) => {
      if (!actor) throw new Error("No autenticado");
      return actor.createOrder(
        productId,
        sellerId,
        amountMxn,
        stripePaymentIntentId,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myOrders"] }),
  });
}

export function useMyOrders() {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useChatWithAviBot() {
  return useMutation({
    mutationFn: async (message: string): Promise<string> => {
      // Simulate a small delay for a natural feel
      await new Promise((resolve) =>
        setTimeout(resolve, 800 + Math.random() * 600),
      );
      return generateBotResponse(message);
    },
  });
}

// ─── Conversations & Messages ─────────────────────────────────────────────────

export function useMyConversations() {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  return useQuery<Conversation[]>({
    queryKey: ["myConversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyConversations();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 5_000,
  });
}

export function useChatMessages(conversationId: string, enabled: boolean) {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  return useQuery<Message[]>({
    queryKey: ["chatMessages", conversationId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversationMessages(conversationId);
    },
    enabled:
      enabled && !!actor && !isFetching && !!identity && !!conversationId,
    refetchInterval: 3_000,
  });
}

export function useUnreadCount() {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnreadCount();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 10_000,
  });
}

export function useCreateConversation() {
  const { actor } = useActorInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sellerId,
      productId,
    }: {
      sellerId: string;
      productId: string;
    }) => {
      if (!actor) throw new Error("No autenticado");
      return actor.createConversation(sellerId, productId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["myConversations"] }),
  });
}

export function useSendMessage() {
  const { actor } = useActorInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      text,
    }: {
      conversationId: string;
      text: string;
    }) => {
      if (!actor) throw new Error("No autenticado");
      return actor.sendMessage(conversationId, text);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", vars.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["myConversations"] });
    },
  });
}

export function useMarkAsRead() {
  const { actor } = useActorInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!actor) throw new Error("No autenticado");
      return actor.markConversationAsRead(conversationId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] }),
  });
}
