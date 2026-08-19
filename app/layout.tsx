import type { Metadata } from "next";
import { Poppins, Play } from "next/font/google";
import "./globals.css";

// Body font used across inforens.com
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Display/heading font used on the reference page
const play = Play({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-play",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loan Calculator | Inforens",
  description:
    "Estimate your education-loan EMI, total interest, and total repayment amount.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${play.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
