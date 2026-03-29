import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZeroPing — Local LLM Code Review",
  description:
    "Review your code locally with Ollama. No API keys. No internet. Your code never leaves your machine.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}

