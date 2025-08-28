import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zappy",
  description: "Your personal Game, Anime, and Movie recommender.",
  // Add the following lines:
  openGraph: {
    images: ['/zappy.png'], // Replace with the actual path to your image
  },
  twitter: {
    card: "summary_large_image", // Important for Twitter to display the image
    images: ['/zappy.png'], // Replace with the actual path to your image
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}