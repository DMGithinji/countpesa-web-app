import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, LayoutDashboard, Users, Tags, AlignJustify } from "lucide-react";
import { useDemoMode } from "@/context/RepositoryContext";
import { cn } from "@/lib/utils";
import logoLg from "../assets/logo-lg.svg";
import { Button } from "./ui/button";
import Header, { HeaderWithFilters } from "./Header";
import { Sidepanel } from "./Sidepanel";
import AIAnalysisSheet from "./AIAnalysisSheet";
import AppPromo from "./AppPromo";

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const isDemoMode = useDemoMode();
  const hasTransactions = useMemo(
    () => !isDemoMode && location.pathname !== "/",
    [isDemoMode, location.pathname]
  );

  // Check screen size on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
      // Auto-collapse sidebar on screens below 1280px
      if (window.innerWidth < 1280) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = useMemo(() => {
    const pathPrefix = isDemoMode ? "/demo" : "";
    return [
      {
        path: `${pathPrefix}/dashboard`,
        icon: <LayoutDashboard size={20} />,
        label: "Dashboard",
      },
      {
        path: `${pathPrefix}/transactions`,
        icon: <AlignJustify size={20} />,
        label: "Transactions",
      },
      {
        path: `${pathPrefix}/accounts`,
        icon: <Users size={20} />,
        label: "Senders/Receivers",
      },
      {
        path: `${pathPrefix}/categories`,
        icon: <Tags size={20} />,
        label: "Categories",
      },
    ];
  }, [isDemoMode]);

  return (
    <div>
      {isDemoMode && (
        <div className=" w-full h-[1rem] flex justify-center items-center text-xs bg-[#FE7F51] text-background font-medium">
          This is Demo Data
        </div>
      )}
      <div
        className={cn(
          "flex flex-col h-screen overflow-hidden sm:flex-row font-font-inter",
          isDemoMode && "h-[calc(100vh-1rem)]"
        )}
      >
        {/* Sidebar - Hidden on mobile, minimized on md */}
        {!isMobile && (
          <div
            className={`bg-secondary flex-col border-r  transition-all duration-300 hidden sm:flex ${
              collapsed ? "w-16" : "w-56"
            }`}
          >
            {/* Logo */}
            <div className="p-4 flex items-center justify-between h-16">
              <Link to={hasTransactions ? "/dashboard" : "/"} className="flex items-center">
                {!collapsed && <img src={logoLg} alt="CountPesa" className="w-36 h-16 mr-4" />}
                {collapsed && <div className="text-primary font-bold px-2 py-1 rounded">CP</div>}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSidebar}
                className="bg-secondary shadow cursor-pointer w-5 h-5 z-50 mr-[-26px] mb-[-48px] hover:text-background-foreground opacity-50 hover:opacity-100"
              >
                <ChevronLeft
                  size={20}
                  className={`transform transition-transform text-foreground/60 ${collapsed ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-2 px-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-lg transition-colors text-[15px] text-foreground/90 font-[500] ${
                        location.pathname === item.path ? "text-primary" : "hover:text-primary"
                      }`}
                    >
                      <span className={collapsed ? "mx-auto" : "mr-3"}>{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
              {!collapsed && <AppPromo />}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header />
          <main className="flex-1 overflow-y-auto ">
            <div className="mx-auto px-2 md:px-4 pb-20 sm:pb-8 relative">
              <HeaderWithFilters />
              <div className="pt-2 max-w-[1820px] mx-auto">{children}</div>
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <nav className="fixed bottom-0 left-0 right-0 bg-secondary border-t shadow z-10">
              <ul className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                  <li key={item.path} className="flex-1">
                    <Link
                      to={item.path}
                      className={`flex flex-col items-center justify-center h-full py-1 ${
                        location.pathname === item.path ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      {item.icon}
                      <span className="text-xs mt-1">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <Sidepanel />
          <AIAnalysisSheet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
