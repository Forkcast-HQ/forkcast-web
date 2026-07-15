import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/lib/auth";
import { UserProvider } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TodayBar } from "@/components/TodayBar";

export const metadata: Metadata = {
  title: "Forkcast — Know before you go",
  description:
    "Nutrition-aware restaurant recommendations. Plan what you'll eat out before you go, match dishes to your goals, and track every meal.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f4ec",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AuthProvider>
          <UserProvider>
            <Navbar />
            <main id="main-content" tabIndex={-1}>{children}</main>
            <Footer />
            <TodayBar />
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
