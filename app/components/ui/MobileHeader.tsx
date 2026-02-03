"use client";

import { useState, useEffect, useRef } from "react";
import DarkModeToggle from "./DarkModeToggle";

interface MobileHeaderProps {
  children: React.ReactNode;
}

export default function MobileHeader({ children }: MobileHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at top
      if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        // Hide header when scrolling down (after 60px threshold)
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`fixed left-0 right-0 top-0 z-50 hidden max-md:block transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex h-[60px] w-full items-center gap-2 bg-bg-0 px-6 py-2 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.1)]">
        {children}
        <DarkModeToggle variant="inline" />
      </div>
    </header>
  );
}
