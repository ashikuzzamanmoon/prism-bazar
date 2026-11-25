import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { eventName, eventData, userAgent, clientIp, url } = data;

    console.log(`[Server Tracking] Received Event: ${eventName}`, data);

    // ==========================================
    // 1. Google Analytics 4 (Measurement Protocol)
    // ==========================================
    const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || "G-DEMO12345";
    const GA4_API_SECRET = process.env.GA4_API_SECRET || "DEMO_API_SECRET";
    
    // We send data async without awaiting unless absolutely necessary to speed up response
    const ga4Payload = {
      client_id: eventData.clientId || "unknown_client", // In production get from _ga cookie
      events: [{
        name: eventName,
        params: {
          ...eventData,
          server_event: true,
          page_location: url,
        }
      }]
    };

    fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`, {
      method: "POST",
      body: JSON.stringify(ga4Payload)
    }).catch(err => console.error("GA4 Error:", err));


    // ==========================================
    // 2. Facebook Conversions API (CAPI)
    // ==========================================
    const CAPI_TOKEN = process.env.FB_CAPI_TOKEN || "DEMO_FB_CAPI_TOKEN";
    const FB_PIXEL_ID = process.env.FB_PIXEL_ID || "DEMO_PIXEL_ID";

    const fbPayload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: url,
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
            // optionally add fbc, fbp cookies if available from eventData
          },
          custom_data: {
            ...eventData
          }
        }
      ]
    };

    fetch(`https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${CAPI_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fbPayload)
    }).catch(err => console.error("FB CAPI Error:", err));


    // Send immediate response to client
    return NextResponse.json({ success: true, message: "Event queued for server tracking." });

  } catch (error) {
    console.error("[Server Tracking] API Route Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
