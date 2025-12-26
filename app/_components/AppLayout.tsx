"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import Image from "next/image";
import Loading from "./Loading";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string | null;
};

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const useUser = () => {
  const context = useContext(UserContext);
  return context.user;
};

export const useSetUser = () => {
  const context = useContext(UserContext);
  return context.setUser;
};

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export default function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [headerFloating, setHeaderFloating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Fetching user from /api/auth/me...');
        const res = await fetch("/api/auth/me", {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Response status:', res.status);
        if (!res.ok) {
          console.log('Not authenticated, redirecting to login');
          router.push("/auth?mode=signin");
          return;
        }
        const data = await res.json();
        console.log('User data received:', data);
        setUser(data.user);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/auth?mode=signin");
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="relative min-h-screen bg-slate-50">
        {showHeader ? (
          <>
            {/* Fixed header at top (works even if ancestors have overflow) */}
            <header
              className={`${headerFloating ? "absolute" : "fixed"} top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-200`}
            >
              <div className="flex w-full">
                {/* Sidebar Logo desktop */}
                <button
                  onClick={() => router.push("/")}
                  className="hidden lg:flex w-64 h-20 bg-white border-r border-gray-200 items-center px-5 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-8 rounded-lg overflow-hidden">
                      <Image
                        src="/images/icon/logo.png"
                        alt="Lahap Logo"
                        width={32}
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-black text-lg font-semibold">Lahap</div>
                  </div>
                </button>

                {/* Header */}
                <Header user={user} currentPath={pathname} onFloatingChange={setHeaderFloating} />
              </div>
            </header>

            {/* Main content with top padding to account for fixed header */}
            <div className="pt-20">{children}</div>
          </>
        ) : (
          <div>{children}</div>
        )}
      </div>
    </UserContext.Provider>
  );
}
