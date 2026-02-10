// TypeScript definitions for Google Analytics gtag
declare global {
  interface Window {
    gtag: (...args: [string, ...unknown[]]) => void;
    dataLayer: unknown[];
  }
}

export {};
