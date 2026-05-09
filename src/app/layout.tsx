import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hotel Compare",
  description: "Compare hotel prices and convenience across booking platforms.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a href="/" className="brand">
            🏨 Hotel Compare
          </a>
          <nav>
            <a href="/">Search</a>
            <a href="https://github.com/mrseng86/loan-system" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
