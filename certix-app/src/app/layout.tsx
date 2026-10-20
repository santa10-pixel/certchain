import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/lib/contexts/RoleContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "CertiX - Verifiable Academic Credentials",
  description: "Secure platform for issuing and verifying academic credentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark font-sans">
      <body className="bg-slate-950 text-slate-50 antialiased font-sans">
        <RoleProvider>
          <AppShell>{children}</AppShell>
        </RoleProvider>
      </body>
    </html>
  );
}
