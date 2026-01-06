"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrendingUp,
  Newspaper,
  ChevronDown,
  Crown,
  User,
  LogOut,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const navigation = [
    {
      name: "Charts",
      href: "/charts",
      icon: TrendingUp,
      description: "Real-time price charts (TradingView style)",
    },
    {
      name: "News",
      href: "/news",
      icon: Newspaper,
      description: "Multi-source news crawler with AI analysis",
    },
  ];

  const getFullName = (user: { firstName: string; lastName: string }) => {
    return `${user.firstName} ${user.lastName}`.trim();
  };

  const getInitials = (user: { firstName: string; lastName: string }) => {
    return `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase();
  };

  return (
    <nav className="border-b sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-xl font-bold flex items-center gap-2"
            >
              <TrendingUp className="h-6 w-6" />
              <span className="hidden sm:inline">Crypto Platform</span>
            </Link>
            {isAuthenticated && (
              <>
                {/* Desktop Navigation */}
                <div className="hidden lg:flex space-x-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                          pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        }`}
                        title={item.description}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Navigation Dropdown */}
                <div className="lg:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Menu
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link
                              href={item.href}
                              className={`flex items-center gap-2 ${
                                pathname === item.href ? "bg-accent" : ""
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {item.description}
                                </span>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={getFullName(user)} />
                      <AvatarFallback>{getInitials(user)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                          {getFullName(user)}
                        </p>
                        {user.accountType === "VIP" && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      {user.accountType && (
                        <p className="text-xs leading-none text-muted-foreground pt-1">
                          <span
                            className={
                              user.accountType === "VIP"
                                ? "text-yellow-600 font-medium"
                                : ""
                            }
                          >
                            {user.accountType}
                          </span>{" "}
                          Account
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
