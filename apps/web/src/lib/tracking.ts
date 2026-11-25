import { sendGTMEvent } from "@next/third-parties/google";

type TrackingEventParams = {
  eventName: string;
  eventData?: Record<string, any>;
};


export async function trackEvent({ eventName, eventData = {} }: TrackingEventParams) {
  // 1. Client-Side standard GTM push
  try {
    sendGTMEvent({ event: eventName, ...eventData });
  } catch (error) {
    console.warn("Client GTM Error:", error);
  }

  // 2. Server-Side Direct Tracking Call
  try {
    const payload = {
      eventName,
      eventData,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      // Optional: Since it's client-side to our own server, our server will resolve client IP naturally in prod
    };

    fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // Keep alive ensures the request finishes even if the user navigates away fast
      keepalive: true,
    }).catch(console.error);

  } catch (err) {
    console.error("Server API Tracking push error:", err);
  }
}
