import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { generateUserId, storeUserToken } from "@/lib/token-manager";

export async function GET(req: NextRequest) {
  console.log("=== META CALLBACK HIT ===");

  console.log("Full callback URL:", req.url);
  console.log("Search Params:", req.nextUrl.searchParams.toString());

  const code = req.nextUrl.searchParams.get("code");
  console.log("Code received:", code);

  if (!code) {
    console.error("❌ No code received in callback.");
    return NextResponse.json({ error: "No code received" }, { status: 400 });
  }

  // Log ENV values to ensure correct values are used
  console.log("ENV META_APP_ID:", process.env.META_APP_ID);
  console.log("ENV META_APP_SECRET:", process.env.META_APP_SECRET);
  console.log("ENV META_REDIRECT_URI:", process.env.META_REDIRECT_URI);

  try {
    console.log("📌 Exchanging short-lived token...");

    const shortTokenRes = await axios.get(
      "https://graph.facebook.com/v21.0/oauth/access_token",
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.META_REDIRECT_URI,
          code,
        },
      }
    );

    console.log("Short Token Response:", shortTokenRes.data);

    const shortToken = shortTokenRes.data.access_token;
    console.log("Short-lived Token:", shortToken);

    console.log("📌 Exchanging for long-lived token...");

    const longTokenRes = await axios.get(
      "https://graph.facebook.com/v21.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: shortToken,
        },
      }
    );

    console.log("Long Token Response:", longTokenRes.data);

    const longToken = longTokenRes.data.access_token;
    console.log("Long-lived Token:", longToken);

    console.log("📌 Fetching user info...");

    const userRes = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${longToken}`
    );

    console.log("User Info:", userRes.data);

    console.log("📌 Fetching user pages...");

    const pagesRes = await axios.get(
      `https://graph.facebook.com/me/accounts?fields=id,name,access_token,category,tasks&access_token=${longToken}`
    );

    console.log("Pages Response:", pagesRes.data);

    if (!pagesRes.data.data || pagesRes.data.data.length === 0) {
      console.warn("⚠️ No Facebook pages found!");

      const url = new URL("/dashboard", req.url);
      url.searchParams.set("error", "no_page");
      url.searchParams.set(
        "message",
        "No Facebook pages found. Make sure you're an admin of a Facebook page and granted page permissions."
      );
      return NextResponse.redirect(url);
    }

    const pageData = pagesRes.data.data[0];
    console.log("Selected Page:", pageData);

    const pageId = pageData.id;

    console.log("📌 Checking Instagram Business Account...");

    let igBusinessId = null;

    try {
      const igRes = await axios.get(
        `https://graph.facebook.com/${pageId}?fields=instagram_business_account&access_token=${longToken}`
      );

      console.log("Instagram Lookup Response:", igRes.data);

      igBusinessId = igRes.data.instagram_business_account?.id;
    } catch (igError) {
      console.warn("⚠️ IG Business Account lookup failed (optional).", igError);
    }

    console.log("📌 Storing tokens in DB...");

    const userId = generateUserId(req);
    console.log("Generated User ID:", userId);

    await storeUserToken(userId, {
      accessToken: longToken,
      pageId: pageId,
      pageName: pageData.name,
      igBusinessId: igBusinessId || undefined,
      userName: userRes.data.name,
      email: userRes.data.email,
    });

    console.log("✔️ User token stored successfully.");

    const url = new URL("/dashboard", req.url);
    url.searchParams.set("connected", "true");
    url.searchParams.set("userId", userId);
    url.searchParams.set("userName", userRes.data.name);

    console.log("Redirecting to dashboard…", url.toString());

    return NextResponse.redirect(url);

  } catch (err) {
    const error = err as {
      response?: { status: number; data: unknown; headers: unknown };
      message: string;
    };

    console.error("❌ Meta Callback Error:", error.message);

    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", error.response.data);
      console.error("Response Headers:", error.response.headers);
    }

    return NextResponse.json(
      {
        error: "Token exchange failed",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
