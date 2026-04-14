import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyOrders } from "@/hooks/use-backend";
import { formatPrice } from "@/types/marketplace";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

function ConfirmationSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 px-4">
      <Skeleton className="w-20 h-20 rounded-full" />
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72" />
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{
          background: "rgba(0,255,255,0.04)",
          border: "1px solid rgba(0,255,255,0.15)",
        }}
      >
        {["r1", "r2", "r3"].map((k) => (
          <div key={k} className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-11 w-36 rounded-lg" />
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: "/orden/$orderId" });
  const navigate = useNavigate();
  const { data: orders, isLoading } = useMyOrders();

  const order = orders?.find((o) => o.id === orderId);

  useEffect(() => {
    if (!isLoading && orders && !order) {
      toast.error("No se encontró la orden especificada.");
      navigate({ to: "/perfil" });
    }
  }, [isLoading, orders, order, navigate]);

  if (isLoading || (!order && !orders)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <ConfirmationSkeleton />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-10"
      data-ocid="order-confirmation-page"
    >
      {/* ── Success Header ─── */}
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-subtle"
          style={{
            background: "rgba(0,255,255,0.08)",
            border: "2px solid rgba(0,255,255,0.4)",
            boxShadow: "0 0 32px rgba(0,255,255,0.2)",
          }}
          data-ocid="success-icon"
        >
          <CheckCircle2
            className="w-10 h-10"
            style={{ color: "#00FFFF" }}
            strokeWidth={1.8}
          />
        </div>
        <div className="space-y-2">
          <h1
            className="font-display font-bold text-3xl"
            style={{ color: "#00FFFF" }}
          >
            ¡Pago exitoso!
          </h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto">
            Tu compra ha sido procesada correctamente. ¡Gracias por usar Tijuana
            Shop AE!
          </p>
        </div>
      </div>

      {/* ── Order Details Card ─── */}
      <div
        className="rounded-2xl p-6 space-y-4 mb-6"
        style={{
          background: "rgba(0,255,255,0.04)",
          border: "1px solid rgba(0,255,255,0.2)",
        }}
        data-ocid="order-details-card"
      >
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4" style={{ color: "#00FFFF" }} />
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wider">
            Detalles del pedido
          </h2>
        </div>

        <div className="divide-y divide-border/40 space-y-0">
          <div className="flex justify-between items-center py-3">
            <span className="text-sm text-muted-foreground">
              Número de orden
            </span>
            <span
              className="text-sm font-mono font-medium"
              style={{ color: "#00FFFF" }}
              data-ocid="order-id"
            >
              #{order.id.slice(0, 12).toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-sm text-muted-foreground">Monto pagado</span>
            <span
              className="text-base font-bold"
              style={{ color: "#00FFFF" }}
              data-ocid="order-amount"
            >
              {formatPrice(Number(order.amountMxn))}
            </span>
          </div>

          {order.stripePaymentIntentId && (
            <div className="flex justify-between items-start gap-4 py-3">
              <span className="text-sm text-muted-foreground shrink-0">
                Referencia de pago
              </span>
              <span
                className="text-xs font-mono text-right break-all max-w-[200px]"
                style={{ color: "rgba(0,255,255,0.7)" }}
                data-ocid="order-payment-ref"
              >
                {order.stripePaymentIntentId}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-3">
            <span className="text-sm text-muted-foreground">Estado</span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(0,255,255,0.1)",
                border: "1px solid rgba(0,255,255,0.3)",
                color: "#00FFFF",
              }}
            >
              Completado
            </span>
          </div>
        </div>
      </div>

      {/* ── Seller Contact Notice ─── */}
      <div
        className="rounded-xl p-4 flex items-start gap-3 mb-8"
        style={{
          background: "rgba(0,255,255,0.06)",
          border: "1px solid rgba(0,255,255,0.2)",
        }}
        data-ocid="seller-contact-notice"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(0,255,255,0.12)" }}
        >
          <ShoppingBag className="w-4 h-4" style={{ color: "#00FFFF" }} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            El vendedor te contactará pronto
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            El vendedor recibirá la notificación de tu compra y se pondrá en
            contacto contigo para coordinar la entrega. Recuerda reunirte en
            lugares públicos y seguros de Tijuana.
          </p>
        </div>
      </div>

      {/* ── Action Buttons ─── */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/perfil">
          <Button
            className="w-full sm:w-auto h-11 px-6 font-semibold transition-smooth"
            style={{
              background: "rgba(0,255,255,0.15)",
              border: "1px solid rgba(0,255,255,0.5)",
              color: "#00FFFF",
            }}
            data-ocid="view-orders-btn"
          >
            Ver mis compras
          </Button>
        </Link>

        <Link to="/">
          <Button
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 transition-smooth"
            data-ocid="back-home-btn"
          >
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
