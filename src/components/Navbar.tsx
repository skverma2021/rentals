"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  LogIn,
  Building2
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/assets", label: "Assets", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/asset-conditions", label: "Conditions", icon: BarChart3 },
  { href: "/setup", label: "Setup", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between px-6 h-14 bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
      <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
        <Building2 className="h-6 w-6" />
        <span className="hidden sm:inline">Asset Rental</span>
      </Link>

      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                isActive
                  ? "bg-white/20 text-white font-medium"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        {status === "loading" ? (
          <span className="text-white/70 text-sm">Loading...</span>
        ) : session?.user ? (
          <>
            <div className="hidden sm:flex flex-col items-end text-white">
              <span className="text-sm font-medium">
                {session.user.firstName} {session.user.lastName}
              </span>
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {session.user.agencyName}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </>
        ) : (
          <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
            <Link href="/auth/signin">
              <LogIn className="h-4 w-4 mr-1" />
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
