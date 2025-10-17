import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CartProvider } from "@/contexts/CartContext";
import NotificationContainer from "@/components/NotificationContainer";

export const metadata: Metadata = {
  title: "Danki - Delivery Express",
  description: "Tu delivery express de confianza. Pedidos frescos y rápidos directamente a tu puerta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              {children}
              <NotificationContainer />
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
