type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsData = Record<string, AnalyticsValue>;

type UmamiTracker = {
  track: (eventName: string, data?: AnalyticsData) => void;
  identify?: (idOrData: string | AnalyticsData, data?: AnalyticsData) => void;
};

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

export function analyticsEvent(eventName: string, data?: AnalyticsData) {
  const attributes: Record<string, string> = {
    'data-umami-event': eventName,
  };

  if (!data) return attributes;

  for (const [key, value] of Object.entries(data)) {
    if (value == null) continue;
    attributes[`data-umami-event-${key}`] = String(value);
  }

  return attributes;
}

export function trackEvent(eventName: string, data?: AnalyticsData) {
  if (typeof window === 'undefined') return;
  window.umami?.track(eventName, data);
}
