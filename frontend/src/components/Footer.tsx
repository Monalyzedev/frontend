import { Github, Instagram, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const XLogo = () => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 300 300" 
    fill="currentColor" 
    className="w-3.5 h-3.5"
  >
    <path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="w-full bg-background py-8 px-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Monalyze Social Media Links - Left */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hover:text-white hover:bg-violet-600">
              <XLogo />
            </Button>
            <Button variant="ghost" size="icon" className="hover:text-white hover:bg-violet-600">
              <Github className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:text-white hover:bg-violet-600">
              <Instagram className="w-5 h-5" />
            </Button>
          </div>

          {/* Center Text */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-violet-600 fill-violet-600" />
            <span>on Monad</span>
          </div>

          {/* Personal Links - Right */}
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Built by</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:text-white hover:bg-violet-600"
              onClick={() => window.open('https://x.com/rx_wizrd', '_blank')}
            >
              <XLogo />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;