import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, caption, igBusinessId, accessToken } = await req.json();

    if (!imageUrl || !caption || !igBusinessId || !accessToken) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, caption, igBusinessId, accessToken" },
        { status: 400 }
      );
    }

    console.log("📤 Publishing to Instagram...");
    console.log("IG Business ID:", igBusinessId);
    console.log("Caption:", caption);
    console.log("Image URL:", imageUrl);

    // Step 1: Create media container (upload image)
    const containerRes = await axios.post(
      `https://graph.facebook.com/v21.0/${igBusinessId}/media`,
      {
        image_url: imageUrl,
        caption: caption,
        media_type: "IMAGE"
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const creationId = containerRes.data.id;
    console.log("✅ Media container created:", creationId);

    // Step 2: Publish the media
    const publishRes = await axios.post(
      `https://graph.facebook.com/v21.0/${igBusinessId}/media_publish`,
      {
        creation_id: creationId
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("✅ Instagram post published:", publishRes.data);

    return NextResponse.json({
      success: true,
      postId: publishRes.data.id,
      message: "Posted to Instagram successfully!",
    });

  } catch (error) {
    const err = error as { response?: { status: number; data: unknown }; message: string };
    console.error("❌ Instagram publishing error:", err);
    
    if (err.response) {
      console.error("Error response:", err.response.data);
      return NextResponse.json(
        { 
          error: "Instagram API error", 
          details: err.response.data 
        },
        { status: err.response.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to publish to Instagram", details: err.message },
      { status: 500 }
    );
  }
}
