import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-60px)]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
