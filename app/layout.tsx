import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "./components/Navigation";
import { getCurrentUser } from './lib/auth';
import { SocketProvider } from './lib/SocketProvider';
import { ThemeProvider } from './lib/ThemeProvider';

export const metadata: Metadata = {
  title: "SKY-CYBERNET",
  description: "Strategic Cyber Network - Advanced Digital Operations",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get current user from session
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className="antialiased bg-black font-mono text-[#00ff41]">
        <ThemeProvider>
          <SocketProvider userId={currentUser?.id}>
            <div className="flex relative z-10">
              {/* Desktop Navigation Sidebar */}
              {currentUser && (
                <div className="hidden lg:block">
                  <Navigation currentUser={currentUser} />
                </div>
              )}

              {/* Main Content Area */}
              <div className="flex-1 lg:ml-72">
                {children}
              </div>
            </div>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
