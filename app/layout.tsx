import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import DarkModeToggle from "./components/ui/DarkModeToggle";
import { cn } from "./utils/utils";
import { QueryProvider } from "./providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const circularStd = localFont({
  src: [
    {
      path: "../public/font/CircularStd-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/font/CircularStd-Book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/font/CircularStd-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/font/CircularStd-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/font/CircularStd-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-circular-std",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Train Tracker",
  description: "Live train tracking application",
};

const DARK_MODE_SCRIPT = `
  (function() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, circularStd.variable, "antialiased")}>
        <script dangerouslySetInnerHTML={{ __html: DARK_MODE_SCRIPT }} />
        <QueryProvider>
          <DarkModeToggle />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
