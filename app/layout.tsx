import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Conseils de classe - Quorum",
  description: "MVP interne pour gérer la présence des professeurs aux conseils de classe."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <Providers>
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
