import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "./components/Navigation";
import { getCurrentUser } from './lib/auth';
import { isAdmin } from './lib/admin';
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
  const adminAccess = currentUser ? await isAdmin() : false;
  
  // Get user's theme preference from database
  let userTheme: 'green' | 'orange' = 'green';
  if (currentUser) {
    const prisma = (await import('./lib/db')).default;
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { theme: true },
    });
    if (user?.theme === 'orange' || user?.theme === 'green') {
      userTheme = user.theme;
    }
  }

  return (
    <html lang="en">
      <body className="antialiased bg-black font-mono text-[#00ff41]">
        <ThemeProvider initialTheme={currentUser ? userTheme : undefined}>
          <SocketProvider userId={currentUser?.id}>
            <div className="flex relative z-10">
              {/* Desktop Navigation Sidebar */}
              {currentUser && (
                <div className="hidden lg:block">
                  <Navigation currentUser={currentUser} isAdmin={adminAccess} />
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
