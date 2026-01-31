import AuthProvider from "@/components/AuthProvider";
// ... other imports like Inter and globals.css

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {/* Your background decorative elements stay here */}
          <div className="relative z-0">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}