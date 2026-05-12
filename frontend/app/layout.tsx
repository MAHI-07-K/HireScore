import type { Metadata } from "next";
import "./globals.css";
import "./dashboard/warm-theme.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "HireScore | AI Resume Verification",
  description: "Student Module - Resume Verification and Drive Eligibility",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="warm-theme">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
