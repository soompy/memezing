'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {/* 임시로 SessionProvider 비활성화 */}
        {/* <SessionProvider> */}
          {children}
        {/* </SessionProvider> */}
      </ToastProvider>
    </ThemeProvider>
  );
}