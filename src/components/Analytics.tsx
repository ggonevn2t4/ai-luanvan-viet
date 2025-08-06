import { useEffect } from 'react';

interface AnalyticsProps {
  trackingId?: string;
}

const Analytics = ({ trackingId = 'G-XXXXXXXXXX' }: AnalyticsProps) => {
  useEffect(() => {
    // Load Google Analytics
    if (typeof window !== 'undefined') {
      // Create gtag script
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      script.async = true;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', trackingId, {
        page_title: document.title,
        page_location: window.location.href,
      });

      // Track page views on route changes
      const handleRouteChange = () => {
        gtag('config', trackingId, {
          page_title: document.title,
          page_location: window.location.href,
        });
      };

      // Listen for navigation events
      window.addEventListener('popstate', handleRouteChange);

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [trackingId]);

  return null;
};

// Analytics event tracking functions
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-XXXXXXXXXX', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};

export const trackThesisGeneration = (data: {
  topic: string;
  major: string;
  academicLevel: string;
  pages: number;
}) => {
  trackEvent('thesis_generated', {
    event_category: 'AI Generation',
    event_label: data.major,
    value: data.pages,
    custom_parameters: {
      topic: data.topic,
      academic_level: data.academicLevel,
    }
  });
};

export const trackThesisExport = (format: string) => {
  trackEvent('thesis_exported', {
    event_category: 'Export',
    event_label: format,
  });
};

export const trackUserRegistration = () => {
  trackEvent('sign_up', {
    event_category: 'Authentication',
  });
};

export const trackUserLogin = () => {
  trackEvent('login', {
    event_category: 'Authentication',
  });
};

// Type declarations for global gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default Analytics;