import type { Metadata } from "next";
import { B612_Mono, Doto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "./utils/utils";
import { QueryProvider } from "./providers/QueryProvider";
import { Analytics } from "./components/Analytics";

const b612Mono = B612_Mono({
  variable: "--font-b612-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
  weight: ["400", "700"],
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
  metadataBase: new URL("https://trainstracking.in"),
  title: {
    default: " Train tracking - Live indian railways train status | Train running status",
    template: "%s | Live train running status | Where is my train | Live status updates",
  },
  description:
    "Indian railway running status - Get live running status, current location, delay information, and platform details for trains across India.",
  keywords: [
  "train tracking",
  "live train status",
  "Indian Railways",
  "train location",
  "railway tracking",
  "train running status",
  "real time train status",
  "spot your train",
  "train ETA",
  "live Indian trains",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://trainstracking.in",
      title: "Live train running status | Where is my train | Live status updates",
      description:
      "Track Indian Railways trains in real-time. Get live running status, current location, delay information, and platform details.",
    siteName: "Train Tracker",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Train Tracker - Live Indian Railway Train Tracking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live train running status",
    description:
      "Track Indian Railways trains in real-time with crafted interactions",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon-apple.svg",
  },
  manifest: "/manifest.json",
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
      <body
      suppressHydrationWarning
        className={cn(
          circularStd.variable,
          b612Mono.variable,
          doto.variable,
          "antialiased",
        )}
      >
        <script dangerouslySetInnerHTML={{ __html: DARK_MODE_SCRIPT }} />
        <Analytics />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
