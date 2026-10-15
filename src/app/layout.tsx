import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import ConvexClerkProvider from "@/components/providers/ConvexClerkProvider";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "react-hot-toast";


const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Interview Platform",
    template: "%s | Interview Platform",
  },
  description:
    "Plateforme d'interviews techniques en temps réel — Next.js, Convex, Clerk & Stream.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn("font-sans antialiased", fontSans.variable)}
    >
      <body className="min-h-screen bg-background text-foreground">
        <ConvexClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
            {/* ✅ Toaster placé à l'intérieur du ThemeProvider pour hériter du thème */}
            <Toaster position="top-center" />
          </ThemeProvider>
        </ConvexClerkProvider>
      </body>
    </html>
  );
}