import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useSupabaseAuth"; // Updated import path
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  User,
  X,
} from "lucide-react";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; text: string }[]>([]);

  // Handle navigation to have proper history stack
  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  // Mock notifications
  useEffect(() => {
    if (user?.role === "admin" || user?.role === "superadmin") {
      setNotifications([
        { id: "1", text: "New support request assigned to you" },
        { id: "2", text: "A request was escalated" },
      ]);
    } else if (user?.role === "student") {
      setNotifications([
        { id: "1", text: "Your request has been responded to" },
      ]);
    }
  }, [user]);

  // Navigation links based on role
  const getNavigationLinks = () => {
    const basePath = "/dashboard";
    
    if (user?.role === "student") {
      return [
        { name: "Dashboard", href: `${basePath}/student`, icon: <Home className="h-5 w-5" /> },
        { name: "My Requests", href: `${basePath}/student`, icon: <MessageCircle className="h-5 w-5" /> },
      ];
    }
    
    if (user?.role === "admin") {
      return [
        { name: "Dashboard", href: `${basePath}/admin`, icon: <Home className="h-5 w-5" /> },
        { name: "Requests", href: `${basePath}/admin`, icon: <MessageCircle className="h-5 w-5" /> },
      ];
    }
    
    if (user?.role === "superadmin") {
      return [
        { name: "Dashboard", href: `${basePath}/superadmin`, icon: <Home className="h-5 w-5" /> },
        { name: "Requests", href: `${basePath}/superadmin`, icon: <MessageCircle className="h-5 w-5" /> },
      ];
    }
    
    return [];
  };
  
  const navLinks = getNavigationLinks();

  // Constructing the user's initials for the avatar
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate("/")}>
            <div className="rounded-full bg-srmblue p-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="M8 4h8v5H8V4Z" />
              </svg>
            </div>
            <span className="font-semibold text-lg hidden md:inline-block">SRM Support Hub</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className={`flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer ${
                  location.pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => handleNavigate(link.href)}
              >
                {link.icon}
                {link.name}
              </div>
            ))}
          </nav>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-full">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                      {notification.text}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigate("/dashboard/profile")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-srmblue p-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                  <path d="M8 4h8v5H8V4Z" />
                </svg>
              </div>
              <span className="font-semibold text-lg">SRM Support Hub</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="container py-8 grid gap-4">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="flex items-center gap-2 text-lg font-medium py-2 cursor-pointer"
                onClick={() => {
                  handleNavigate(link.href);
                  toggleMobileMenu();
                }}
              >
                {link.icon}
                {link.name}
              </div>
            ))}
            <div
              className="flex items-center gap-2 text-lg font-medium py-2 cursor-pointer"
              onClick={() => {
                handleNavigate("/dashboard/profile");
                toggleMobileMenu();
              }}
            >
              <User className="h-5 w-5" />
              Profile
            </div>
            <button
              className="flex items-center gap-2 text-lg font-medium py-2 text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </nav>
        </div>
      )}
      
      <main className="flex-1">
        <div className="container py-8">
          {children}
        </div>
      </main>
      
      <footer className="border-t py-4">
        <div className="container flex flex-col gap-2 md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SRM Institute Support Hub
          </p>
          <p className="text-sm text-muted-foreground">
            <a href="#" className="underline underline-offset-4 hover:text-foreground">
              Terms
            </a>{" "}
            &bull;{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground">
              Privacy
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
