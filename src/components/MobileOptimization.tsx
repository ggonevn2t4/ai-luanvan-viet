import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

interface MobileOptimizationProps {
  children: React.ReactNode;
}

const MobileOptimization = ({ children }: MobileOptimizationProps) => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [window.location.pathname]);

  // Add mobile-specific meta tags
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Viewport meta tag for mobile
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

      // Apple mobile web app capable
      let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      if (!appleMeta) {
        appleMeta = document.createElement('meta');
        appleMeta.setAttribute('name', 'apple-mobile-web-app-capable');
        appleMeta.setAttribute('content', 'yes');
        document.head.appendChild(appleMeta);
      }

      // Mobile theme color
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        themeColorMeta.setAttribute('content', '#6366f1');
        document.head.appendChild(themeColorMeta);
      }
    }
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-optimized">
      {children}
      
      {/* Add mobile-specific CSS class */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .mobile-optimized button {
              min-height: 44px;
              min-width: 44px;
            }
            
            .mobile-optimized {
              font-size: 16px;
              line-height: 1.5;
              overflow-x: hidden;
            }
            
            .mobile-optimized .container {
              padding-left: 1rem;
              padding-right: 1rem;
            }
            
            .mobile-optimized input,
            .mobile-optimized textarea,
            .mobile-optimized select {
              font-size: 16px;
              padding: 12px;
            }
          }
        `
      }} />
    </div>
  );
};

export default MobileOptimization;