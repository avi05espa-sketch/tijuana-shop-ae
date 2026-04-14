import {
  ProductCategory,
  ProductCondition,
  ProductStatus,
  ProductZone,
  ReportStatus,
  ReportType,
  UserRole,
  UserStatus,
} from "../backend";
import type { UserProfile } from "../backend";

export {
  ProductCategory,
  ProductCondition,
  ProductZone,
  UserRole,
  UserStatus,
  ProductStatus,
  ReportStatus,
  ReportType,
};

export type SellerBadge = "Verificado" | "Top Vendedor" | "Usuario Nuevo";

export function getBadge(user: UserProfile): SellerBadge {
  if (user.verified) return "Verificado";
  if (Number(user.totalSales) >= 20 && user.avgRating >= 4.5)
    return "Top Vendedor";
  return "Usuario Nuevo";
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-MX", { maximumFractionDigits: 0 })} MXN`;
}

export function formatCondition(condition: ProductCondition): string {
  return condition === ProductCondition.nuevo ? "Nuevo" : "Usado";
}

export function formatZone(zone: ProductZone): string {
  const map: Record<ProductZone, string> = {
    [ProductZone.playas]: "Playas",
    [ProductZone.otay]: "Otay",
    [ProductZone.centro]: "Centro",
    [ProductZone.corredor2000]: "Corredor 2000",
  };
  return map[zone] ?? zone;
}

export function formatCategory(category: ProductCategory): string {
  const map: Record<ProductCategory, string> = {
    [ProductCategory.electronico]: "Electrónicos",
    [ProductCategory.mueble]: "Muebles",
    [ProductCategory.auto]: "Autos",
    [ProductCategory.ropa]: "Ropa",
    [ProductCategory.otro]: "Otro",
  };
  return map[category] ?? category;
}
