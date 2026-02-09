"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="loading-spinner-dots size-24 text-text-primary">
        <DotLottieReact
          src="/Loading Spinner (Dots).lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
}
