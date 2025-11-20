import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { generateUserId, storeUserToken } from "@/lib/token-manager";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "No code received" }, { status: 400 });
  }

  try {

    // Exchange code for short-lived token
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

    const shortToken = shortTokenRes.data.access_token;

    // Exchange short-lived token for long-lived token (valid 60 days)
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

    const longToken = longTokenRes.data.access_token;

    // Get user info for verification
    const userRes = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${longToken}`
    );

    // Get the connected Facebook Page
    const pagesRes = await axios.get(
      `https://graph.facebook.com/me/accounts?fields=id,name,access_token,category,tasks&access_token=${longToken}`
    );

    // Check if user has any pages
    if (!pagesRes.data.data || pagesRes.data.data.length === 0) {

      // Redirect to dashboard with instructions to create a page
      const url = new URL("/dashboard", req.url);
      url.searchParams.set("error", "no_page");
      url.searchParams.set("message", "No Facebook pages found. Make sure you're an admin of a Facebook page and granted page permissions.");
      return NextResponse.redirect(url);
    }

    const pageData = pagesRes.data.data[0];
    const pageId = pageData.id;



    // Get the connected Instagram Business Account ID (optional)
    let igBusinessId = null;
    try {
      const igRes = await axios.get(
        `https://graph.facebook.com/${pageId}?fields=instagram_business_account&access_token=${longToken}`
      );

      igBusinessId = igRes.data.instagram_business_account?.id;
    } catch (igError) {
      // Instagram account lookup is optional
    }

    // Store in MongoDB
    const userId = generateUserId(req);

    await storeUserToken(userId, {
      accessToken: longToken,
      pageId: pageId,
      pageName: pageData.name,
      igBusinessId: igBusinessId || undefined,
      userName: userRes.data.name,
      email: userRes.data.email,
    });



    // Redirect to dashboard with confirmation
    const url = new URL("/dashboard", req.url);
    url.searchParams.set("connected", "true");
    url.searchParams.set("userId", userId);
    url.searchParams.set("userName", userRes.data.name);
    return NextResponse.redirect(url);
  } catch (err) {
    const error = err as { response?: { status: number; data: unknown; headers: unknown }; message: string };
    console.error("Meta Callback Error:", error.message);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }

    return NextResponse.json({
      error: "Token exchange failed",
      details: error.response?.data || error.message
    }, { status: 500 });
  }
}
