import { ToastNotificationProvider } from "@/components/ToastNotification";
import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";
import { useCurrentUser } from "@/hooks/use-backend";
import AdminAuditPage from "@/pages/AdminAuditPage";
import AdminConfigPage from "@/pages/AdminConfigPage";
import AdminPage from "@/pages/AdminPage";
import AdminProductsPage from "@/pages/AdminProductsPage";
import AdminReportsPage from "@/pages/AdminReportsPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import ChatListPage from "@/pages/ChatListPage";
import ChatThreadPage from "@/pages/ChatThreadPage";
import FavoritesPage from "@/pages/FavoritesPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import MapPage from "@/pages/MapPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import PrivacyPage from "@/pages/PrivacyPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import PublishPage from "@/pages/PublishPage";
import PuntosEntregaPage from "@/pages/PuntosEntregaPage";
import SellerStatsPage from "@/pages/SellerStatsPage";
import SettingsPage from "@/pages/SettingsPage";
import TermsPage from "@/pages/TermsPage";
import VendorProfilePage from "@/pages/VendorProfilePage";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { toast } from "sonner";

// ─── Auth Guard Component ─────────────────────────────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useCurrentUser();
  const { isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Show a brief message — the page component handles redirect via useEffect
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-6 h-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        <p className="text-muted-foreground text-sm">Redirigiendo…</p>
      </div>
    );
  }

  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, isAuthenticated } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    if (!isLoading) {
      toast.error("Acceso no autorizado.");
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// ─── Root Route ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <ToastNotificationProvider>
        <Outlet />
        <Toaster position="top-right" richColors />
      </ToastNotificationProvider>
    </Layout>
  ),
});

// ─── Routes ───────────────────────────────────────────────────────────────────
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const productoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/producto/$id",
  component: ProductDetailPage,
});

const vendedorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendedor/$id",
  component: VendorProfilePage,
});

const publicarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/publicar",
  component: PublishPage,
});

const favoritosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/favoritos",
  component: FavoritesPage,
});

const perfilRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/perfil",
  component: () => (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AdminGuard>
      <AdminPage />
    </AdminGuard>
  ),
});

const adminUsuariosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/usuarios",
  component: () => (
    <AdminGuard>
      <AdminUsersPage />
    </AdminGuard>
  ),
});

const adminProductosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/productos",
  component: () => (
    <AdminGuard>
      <AdminProductsPage />
    </AdminGuard>
  ),
});

const adminReportesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/reportes",
  component: () => (
    <AdminGuard>
      <AdminReportsPage />
    </AdminGuard>
  ),
});

const adminConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/configuracion",
  component: () => (
    <AdminGuard>
      <AdminConfigPage />
    </AdminGuard>
  ),
});

const adminAuditoriaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/auditoria",
  component: () => (
    <AdminGuard>
      <AdminAuditPage />
    </AdminGuard>
  ),
});

const terminosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terminos",
  component: TermsPage,
});

const privacidadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacidad",
  component: PrivacyPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const configuracionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/configuracion",
  component: () => (
    <AuthGuard>
      <SettingsPage />
    </AuthGuard>
  ),
});

// ─── New Routes ───────────────────────────────────────────────────────────────
const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: () => (
    <AuthGuard>
      <ChatListPage />
    </AuthGuard>
  ),
});

const chatThreadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$conversationId",
  component: () => (
    <AuthGuard>
      <ChatThreadPage />
    </AuthGuard>
  ),
});

const misEstadisticasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mis-estadisticas",
  component: () => (
    <AuthGuard>
      <SellerStatsPage />
    </AuthGuard>
  ),
});

const mapaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mapa",
  component: MapPage,
});

const puntosEntregaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/puntos-entrega",
  component: PuntosEntregaPage,
});

const ordenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orden/$orderId",
  component: () => (
    <AuthGuard>
      <OrderConfirmationPage />
    </AuthGuard>
  ),
});

// ─── Router ───────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  homeRoute,
  productoRoute,
  vendedorRoute,
  publicarRoute,
  favoritosRoute,
  perfilRoute,
  configuracionRoute,
  adminRoute,
  adminUsuariosRoute,
  adminProductosRoute,
  adminReportesRoute,
  adminConfigRoute,
  adminAuditoriaRoute,
  terminosRoute,
  privacidadRoute,
  loginRoute,
  chatRoute,
  chatThreadRoute,
  misEstadisticasRoute,
  mapaRoute,
  puntosEntregaRoute,
  ordenRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
