import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientProviders from "@/providers/ClientProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "밈징 - 누구나 쉽게 밈을 만드는 플랫폼",
  description: "한국 문화에 특화된 밈 생성 플랫폼. 드래그 앤 드롭으로 쉽게 밈을 만들고 공유하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link href="https://fonts.googleapis.com/css?family=Black+Han+Sans:400" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Nanum+Myeongjo:400" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Gamja+Flower:400" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Do+Hyeon:400" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Jua:400" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Gothic+A1:100" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
