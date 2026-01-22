import type { Metadata } from "next";
import { B612_Mono, Doto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import DarkModeToggle from "./components/ui/DarkModeToggle";
import { cn } from "./utils/utils";
import { QueryProvider } from "./providers/QueryProvider";
import { Agentation } from "agentation";


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
      <body
        className={cn(
      
          circularStd.variable,
          b612Mono.variable,
          doto.variable,
          "antialiased",
        )}
      >
        <script dangerouslySetInnerHTML={{ __html: DARK_MODE_SCRIPT }} />
        <QueryProvider>
          <DarkModeToggle />
          <Agentation />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
