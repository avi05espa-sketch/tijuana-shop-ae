import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useActorRef, useListUsers, useProducts } from "@/hooks/use-backend";
import {
  ProductCategory,
  ProductStatus,
  formatCategory,
  formatPrice,
  formatZone,
} from "@/types/marketplace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";

type StatusFilter = "all" | "active" | "hidden" | "blocked" | "paused";

function ProductStatusBadge({ status }: { status: ProductStatus }) {
  if (status === ProductStatus.active)
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs">
        Publicado
      </Badge>
    );
  if (status === ProductStatus.hidden)
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 text-xs">
        Oculto
      </Badge>
    );
  if (status === ProductStatus.blocked)
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
        Bloqueado
      </Badge>
    );
  return (
    <Badge className="bg-muted text-muted-foreground border-border text-xs">
      Pausado
    </Badge>
  );
}

function ProductDetailModal({
  product,
  vendorName,
  open,
  onClose,
}: {
  product: Product;
  vendorName: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground truncate">
            {product.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {product.photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.photos.slice(0, 4).map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Foto del producto"
                  className="w-20 h-20 object-cover rounded-lg border border-border shrink-0"
                />
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Precio
              </p>
              <p className="text-accent font-semibold">
                {formatPrice(product.price)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Estado
              </p>
              <ProductStatusBadge status={product.status} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Categoría
              </p>
              <p className="text-foreground">
                {formatCategory(product.category)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Zona
              </p>
              <p className="text-foreground">{formatZone(product.zone)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Vendedor
              </p>
              <p className="text-foreground truncate">{vendorName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Vistas
              </p>
              <p className="text-foreground">{String(product.views)}</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
              Descripción
            </p>
            <p className="text-foreground text-sm line-clamp-4">
              {product.description}
            </p>
          </div>
          {product.featured && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
              <span>⭐</span>
              <span className="text-yellow-400 text-sm">
                Producto destacado
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductRow({
  product,
  vendorName,
}: {
  product: Product;
  vendorName: string;
}) {
  const { actor } = useActorRef();
  const qc = useQueryClient();
  const [detailOpen, setDetailOpen] = useState(false);

  const toggleStatusMut = useMutation({
    mutationFn: async (status: ProductStatus) => {
      if (!actor) throw new Error("No disponible");
      return actor.updateProductStatus(product.id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Estado del producto actualizado");
    },
    onError: () => toast.error("Error al actualizar estado"),
  });

  const featureMut = useMutation({
    mutationFn: async (featured: boolean) => {
      if (!actor) throw new Error("No disponible");
      return actor.featureProduct(product.id, featured);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        product.featured ? "Destaque eliminado" : "Producto destacado",
      );
    },
    onError: () => toast.error("Error al destacar producto"),
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No disponible");
      return actor.deleteProduct(product.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto eliminado");
    },
    onError: () => toast.error("Error al eliminar producto"),
  });

  const isVisible = product.status === ProductStatus.active;
  const date = new Date(
    Number(product.createdAt) / 1_000_000,
  ).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/30 transition-colors"
        data-ocid={`admin-product-row-${product.id}`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
              {product.photos[0] ? (
                <img
                  src={product.photos[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">
                  📦
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium truncate max-w-[180px]">
                {product.title}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatCategory(product.category)}
              </p>
              {product.featured && (
                <span className="text-xs text-yellow-400">⭐ Destacado</span>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <Link
            to="/vendedor/$id"
            params={{ id: product.sellerId }}
            className="text-accent text-xs hover:underline truncate block max-w-[100px]"
          >
            {vendorName}
          </Link>
        </td>
        <td className="px-4 py-3 text-accent text-sm font-semibold whitespace-nowrap">
          {formatPrice(product.price)}
        </td>
        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
          {formatZone(product.zone)}
        </td>
        <td className="px-4 py-3">
          <ProductStatusBadge status={product.status} />
        </td>
        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
          {date}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-accent hover:bg-accent/10"
              onClick={() => setDetailOpen(true)}
              data-ocid={`admin-detail-product-${product.id}`}
            >
              Ver
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 px-2 text-xs ${
                isVisible
                  ? "text-yellow-400 hover:bg-yellow-500/10"
                  : "text-green-400 hover:bg-green-500/10"
              }`}
              onClick={() =>
                toggleStatusMut.mutate(
                  isVisible ? ProductStatus.hidden : ProductStatus.active,
                )
              }
              disabled={toggleStatusMut.isPending}
              data-ocid={`admin-toggle-product-${product.id}`}
            >
              {isVisible ? "Ocultar" : "Mostrar"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 px-2 text-xs ${
                product.featured
                  ? "text-muted-foreground hover:bg-muted/50"
                  : "text-yellow-400 hover:bg-yellow-500/10"
              }`}
              onClick={() => featureMut.mutate(!product.featured)}
              disabled={featureMut.isPending}
              data-ocid={`admin-feature-${product.id}`}
            >
              {product.featured ? "Quitar ⭐" : "Destacar ⭐"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-red-400 hover:bg-red-500/10"
                  data-ocid={`admin-delete-product-trigger-${product.id}`}
                >
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    ¿Eliminar producto?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Esta acción es irreversible. Se eliminará{" "}
                    <strong className="text-foreground">
                      &ldquo;{product.title}&rdquo;
                    </strong>{" "}
                    permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border text-muted-foreground">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => deleteMut.mutate()}
                    data-ocid={`admin-delete-product-confirm-${product.id}`}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </td>
      </tr>

      <ProductDetailModal
        product={product}
        vendorName={vendorName}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}

export default function AdminProductsPage() {
  const { data: products = [], isLoading } = useProducts({});
  const { data: users = [] } = useListUsers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">(
    "all",
  );

  const vendorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const u of users) map[u.id] = u.name;
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? p.status === ProductStatus.active
            : statusFilter === "hidden"
              ? p.status === ProductStatus.hidden
              : statusFilter === "paused"
                ? p.status === ProductStatus.paused
                : p.status === ProductStatus.blocked;
      const matchCat =
        categoryFilter === "all" ? true : p.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [products, search, statusFilter, categoryFilter]);

  const statusTabs: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "active", label: "Publicados" },
    { id: "hidden", label: "Ocultos" },
    { id: "blocked", label: "Bloqueados" },
    { id: "paused", label: "Pausados" },
  ];

  return (
    <AdminLayout activeTab="productos">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Gestión de Contenido
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            <span className="text-foreground font-medium">
              {filtered.length}
            </span>{" "}
            producto{filtered.length !== 1 ? "s" : ""} encontrado
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Input
            placeholder="Buscar por título…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border-input text-foreground w-full sm:max-w-xs"
            data-ocid="admin-products-search"
          />
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as ProductCategory | "all")
            }
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
            data-ocid="admin-products-category-filter"
          >
            <option value="all">Todas las categorías</option>
            <option value={ProductCategory.electronico}>Electrónicos</option>
            <option value={ProductCategory.mueble}>Muebles</option>
            <option value={ProductCategory.auto}>Autos</option>
            <option value={ProductCategory.ropa}>Ropa</option>
            <option value={ProductCategory.otro}>Otro</option>
          </select>
        </div>

        <div className="flex gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto w-fit">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-smooth whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`admin-products-filter-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Vendedor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Zona
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? ["r0", "r1", "r2", "r3", "r4"].map((rk) => (
                      <tr key={rk} className="border-b border-border">
                        {["c0", "c1", "c2", "c3", "c4", "c5", "c6"].map(
                          (ck) => (
                            <td key={ck} className="px-4 py-3">
                              <Skeleton className="h-5 w-20 rounded" />
                            </td>
                          ),
                        )}
                      </tr>
                    ))
                  : filtered.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        vendorName={
                          vendorMap[product.sellerId] ??
                          `${product.sellerId.slice(0, 8)}…`
                        }
                      />
                    ))}
              </tbody>
            </table>
            {!isLoading && filtered.length === 0 && (
              <div
                className="py-12 text-center text-muted-foreground"
                data-ocid="admin-products-empty"
              >
                <span className="text-4xl block mb-3">📦</span>
                <p>No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
