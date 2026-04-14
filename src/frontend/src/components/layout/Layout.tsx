import type { ReactNode } from "react";
import { AviBot } from "../AviBot";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {/* pt-16: clear fixed top header; pb-16 md:pb-0: clear fixed bottom bar on mobile */}
      <main className="flex-1 pt-16 pb-16 md:pb-0">{children}</main>
      <Footer />
      <AviBot />
    </div>
  );
}
