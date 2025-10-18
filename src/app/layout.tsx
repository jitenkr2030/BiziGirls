import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { CartProvider } from "@/contexts/cart-context";
import { GlobalCart } from "@/components/marketplace/global-cart";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GirlsPreneur - Empowering Women Entrepreneurs",
  description: "All-in-one business and personal development platform designed to empower women entrepreneurs with the tools, knowledge, and support needed to launch, grow, and scale their businesses.",
  keywords: ["GirlsPreneur", "women entrepreneurs", "business platform", "mentorship", "funding", "courses", "networking"],
  authors: [{ name: "GirlsPreneur Team" }],
  openGraph: {
    title: "GirlsPreneur - Empowering Women Entrepreneurs",
    description: "All-in-one platform for women entrepreneurs to launch, grow, and scale their businesses",
    url: "https://girlspreneur.com",
    siteName: "GirlsPreneur",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GirlsPreneur - Empowering Women Entrepreneurs",
    description: "All-in-one platform for women entrepreneurs to launch, grow, and scale their businesses",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <ErrorBoundary>
                {children}
                <GlobalCart />
                <Toaster />
              </ErrorBoundary>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
