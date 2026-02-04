import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 60px)' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
