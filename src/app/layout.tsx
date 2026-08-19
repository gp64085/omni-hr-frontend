import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { STORAGE_KEYS } from "@/constants";
import { UserProfile } from "@/types/user";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniHR - Enterprise Next-Gen HRMS & Work Operating System",
  description:
    "Automated leave approvals, timesheets, role-based security, and workforce management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawUser = cookieStore.get(STORAGE_KEYS.USER)?.value;
  const token = cookieStore.get(STORAGE_KEYS.ACCESS_TOKEN)?.value || null;

  let initialUser: UserProfile | null = null;
  if (rawUser) {
    try {
      initialUser = JSON.parse(decodeURIComponent(rawUser));
    } catch {
      initialUser = null;
    }
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0D14] text-slate-100 selection:bg-indigo-500 selection:text-white">
        <QueryProvider>
          <AuthProvider initialUser={initialUser} initialToken={token}>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
