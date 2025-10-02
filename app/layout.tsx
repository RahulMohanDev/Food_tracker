import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/UserContext";
import UserSelector from "@/components/UserSelector";

export const metadata: Metadata = {
  title: "Macro Tracker",
  description: "Track your daily macros and calories",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <div className="fixed top-4 right-4 z-40">
            <UserSelector />
          </div>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
