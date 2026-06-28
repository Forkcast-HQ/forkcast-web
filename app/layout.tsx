import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/lib/auth";
import { UserProvider } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Forkcast — Know before you go",
  description:
    "Nutrition-aware restaurant recommendations. Plan what you'll eat out before you go, match dishes to your goals, and track every meal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <UserProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
