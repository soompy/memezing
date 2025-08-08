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
        <SessionProvider>
          {children}
        </SessionProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}