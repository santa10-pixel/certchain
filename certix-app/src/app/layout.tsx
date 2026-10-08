import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/lib/contexts/RoleContext";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        <RoleProvider>
          <AppShell>{children}</AppShell>
        </RoleProvider>
      </body>
    </html>
  );
}
