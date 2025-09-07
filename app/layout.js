import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "New Day Medical Store",
  description: "Manage your medical inventory, sales, and more",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google site verification */}
        <meta
          name="google-site-verification"
          content="AEkLDZkLVl8iim9iHD8nshqIwW9c9GXBvg3BXb95jC8"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
