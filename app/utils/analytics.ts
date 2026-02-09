/**
 * Analytics utility functions for tracking user interactions
 * Only tracks in production environment
 */

/**
 * Safely access gtag function with error handling
 */
function getGtag(): ((...args: any[]) => void) | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.gtag || null;
}

/**
 * Check if analytics should be tracked (only in production)
 */
function shouldTrack(): boolean {
  return process.env.NODE_ENV === 'production' && getGtag() !== null;
}

/**
 * Track a page view
 * @param url - The URL path to track
 */
export function trackPageView(url: string): void {
  if (!shouldTrack()) return;

  const gtag = getGtag();
  if (gtag) {
    gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      page_path: url,
    });
  }
}

/**
 * Track a custom event
 * @param action - The action name (e.g., 'click', 'submit', 'search')
 * @param category - The category (e.g., 'navigation', 'train', 'map')
 * @param label - Optional label for additional context
 * @param value - Optional numeric value
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (!shouldTrack()) return;

  const gtag = getGtag();
  if (gtag) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Track train search interaction
 * @param trainNumber - The train number being searched
 */
export function trackTrainSearch(trainNumber: string): void {
  if (!shouldTrack()) return;

  trackEvent('search', 'train', trainNumber);
}

/**
 * Track station selection interaction
 * @param stationName - The name of the station
 * @param stationType - Either 'source' or 'destination'
 */
export function trackStationSelection(
  stationName: string,
  stationType: 'source' | 'destination'
): void {
  if (!shouldTrack()) return;

  trackEvent('select', 'station', `${stationType}: ${stationName}`);
}

/**
 * Track navigation interaction
 * @param destination - Where the user navigated to
 */
export function trackNavigation(destination: string): void {
  if (!shouldTrack()) return;

  trackEvent('navigate', 'navigation', destination);
}

/**
 * Track map interaction
 * @param interactionType - Type of map interaction (zoom, pan, click, etc.)
 */
export function trackMapInteraction(interactionType: string): void {
  if (!shouldTrack()) return;

  trackEvent('interact', 'map', interactionType);
}

/**
 * Track train details view
 * @param trainNumber - The train number being viewed
 */
export function trackTrainDetailsView(trainNumber: string): void {
  if (!shouldTrack()) return;

  trackEvent('view', 'train_details', trainNumber);
}

/**
 * Track error event
 * @param errorType - Type of error
 * @param errorMessage - Error message or description
 */
export function trackError(errorType: string, errorMessage: string): void {
  if (!shouldTrack()) return;

  trackEvent('error', errorType, errorMessage);
}
