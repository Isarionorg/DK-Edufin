import type { Metadata } from "next";
import "@/styles/globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "DKEdufin – Find Your Right College",
  description:
    "Expert college counseling for school students. Discover, compare, and get guided to the right college for your future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}