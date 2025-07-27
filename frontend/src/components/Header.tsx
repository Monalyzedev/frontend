import { Button } from "@/components/ui/button";
import { BarChart3, Wallet, ArrowUpDown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import WalletButton from "@/components/WalletButton";
import NetworkStatus from "@/components/NetworkStatus";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-center relative">
          {/* Logo - moved to top left */}
          <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-6 w-6" />
            <span className="text-2xl font-bold text-foreground">Monalyze</span>
          </div>
          
          {/* Centered Navigation - now truly centered */}
          <nav className="hidden md:flex items-center justify-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
            <Button 
              variant={location.pathname === "/" ? "secondary" : "ghost"} 
              className={location.pathname === "/" ? "bg-violet-600 text-white hover:bg-violet-700" : "text-muted-foreground hover:text-white hover:bg-violet-600"}
              asChild
            >
              <Link to="/">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button 
              variant={location.pathname === "/portfolio" ? "secondary" : "ghost"} 
              className={location.pathname === "/portfolio" ? "bg-violet-600 text-white hover:bg-violet-700" : "text-muted-foreground hover:text-white hover:bg-violet-600"}
              asChild
            >
              <Link to="/portfolio">
                <Wallet className="w-4 h-4 mr-2" />
                Portfolio
              </Link>
            </Button>
            <Button 
              variant={location.pathname === "/swap" ? "secondary" : "ghost"} 
              className={location.pathname === "/swap" ? "bg-violet-600 text-white hover:bg-violet-700" : "text-muted-foreground hover:text-white hover:bg-violet-600"}
              asChild
            >
              <Link to="/swap">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Swap
              </Link>
            </Button>
          </nav>

          {/* Theme Toggle and Connect Wallet - now on the right */}
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <WalletButton />
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-center space-x-4 mt-4">
          <Button 
            variant={location.pathname === "/" ? "secondary" : "ghost"} 
            className={location.pathname === "/" ? "bg-violet-600 text-white hover:bg-violet-700" : "text-muted-foreground hover:text-white hover:bg-violet-600"}
            size="sm"
            asChild
          >
            <Link to="/">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button 
            variant={location.pathname === "/portfolio" ? "secondary" : "ghost"} 
            className={location.pathname === "/portfolio" ? "bg-violet-600 text-white hover:bg-violet-700" : "text-muted-foreground hover:text-white hover:bg-violet-600"}
            size="sm"
            asChild
          >
            <Link to="/portfolio">
              <Wallet className="w-4 h-4 mr-2" />
              Portfolio
            </Link>
          </Button>
          <Button 
            variant={location.pathname === "/swap" ? "secondary" : "ghost"} 
            className={location.pathname === "/swap" ? "bg-violet-600 text-white hover:bg-violet-700" : "text-muted-foreground hover:text-white hover:bg-violet-600"}
            size="sm"
            asChild
          >
            <Link to="/swap">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Swap
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;