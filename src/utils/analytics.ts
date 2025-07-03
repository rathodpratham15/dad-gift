// Free analytics utilities for Dad's Gift

interface AnalyticsEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

interface PageView {
  page: string;
  title: string;
  referrer?: string;
  timestamp: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

class Analytics {
  private isEnabled: boolean;
  private apiUrl: string;
  private sessionId: string;

  constructor() {
    this.isEnabled = !window.location.hostname.includes('localhost');
    this.apiUrl = import.meta.env.VITE_API_URL || '';
    this.sessionId = this.generateSessionId();
    
    if (this.isEnabled) {
      this.initializeAnalytics();
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private initializeAnalytics() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent({
        event: 'page_visibility_change',
        category: 'engagement',
        properties: {
          visibility: document.hidden ? 'hidden' : 'visible'
        }
      });
    });

    // Track performance metrics
    this.trackPerformanceMetrics();
    
    // Track errors
    window.addEventListener('error', (event) => {
      this.trackEvent({
        event: 'javascript_error',
        category: 'error',
        properties: {
          message: event.message,
          filename: event.filename,
          line: event.lineno,
          column: event.colno
        }
      });
    });
  }

  // Track page views
  trackPageView(page: string, title: string = document.title) {
    if (!this.isEnabled) return;

    const pageView: PageView = {
      page,
      title,
      referrer: document.referrer,
      timestamp: Date.now()
    };

    this.sendToAnalytics('pageview', pageView);
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled) return;

    const enrichedEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.sendToAnalytics('event', enrichedEvent);
  }

  // Track property interactions
  trackPropertyView(propertyId: string, propertyTitle: string) {
    this.trackEvent({
      event: 'property_view',
      category: 'property',
      label: propertyTitle,
      properties: {
        propertyId,
        timestamp: Date.now()
      }
    });
  }

  trackPropertyFavorite(propertyId: string, action: 'add' | 'remove') {
    this.trackEvent({
      event: 'property_favorite',
      category: 'property',
      properties: {
        propertyId,
        action,
        timestamp: Date.now()
      }
    });
  }

  trackSearch(query: string, filters: Record<string, any>, resultCount: number) {
    this.trackEvent({
      event: 'property_search',
      category: 'search',
      value: resultCount,
      properties: {
        query,
        filters,
        resultCount,
        timestamp: Date.now()
      }
    });
  }

  // Track performance metrics
  private trackPerformanceMetrics() {
    if (!this.isEnabled) return;

    // Track page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.trackPerformanceMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
          this.trackPerformanceMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          this.trackPerformanceMetric('first_paint', navigation.loadEventEnd - navigation.fetchStart);
        }
      }, 0);
    });

    // Track Core Web Vitals
    this.trackCoreWebVitals();
  }

  private trackPerformanceMetric(name: string, value: number, unit: string = 'ms') {
    const metric: PerformanceMetric = {
      name,
      value: Math.round(value),
      unit,
      timestamp: Date.now()
    };

    this.sendToAnalytics('performance', metric);
  }

  private trackCoreWebVitals() {
    // Track Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackPerformanceMetric('lcp', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // Track First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.trackPerformanceMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }
    }
  }

  // Send data to analytics endpoint
  private async sendToAnalytics(type: string, data: any) {
    try {
      const payload = {
        type,
        data,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      // Send to your analytics endpoint
      await fetch(`${this.apiUrl}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Get user insights
  getUserInsights(): Record<string, any> {
    return {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now()
    };
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Export convenience functions
export const trackPageView = (page: string, title?: string) => analytics.trackPageView(page, title);
export const trackEvent = (event: AnalyticsEvent) => analytics.trackEvent(event);
export const trackPropertyView = (propertyId: string, propertyTitle: string) => analytics.trackPropertyView(propertyId, propertyTitle);
export const trackPropertyFavorite = (propertyId: string, action: 'add' | 'remove') => analytics.trackPropertyFavorite(propertyId, action);
export const trackSearch = (query: string, filters: Record<string, any>, resultCount: number) => analytics.trackSearch(query, filters, resultCount);

export default analytics; 