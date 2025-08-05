'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/context/ThemeContext";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
      {/* 임시로 SessionProvider 비활성화 */}
      {/* <SessionProvider> */}
        {children}
      {/* </SessionProvider> */}
    </ThemeProvider>
  );
}