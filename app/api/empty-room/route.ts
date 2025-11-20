import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';
import { checkRateLimit } from '@/lib/redis';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface EmptyRoomRequest {
    imageUrls: string[];
    selectedIndices: number[];
}

interface EmptyRoomResponse {
    success: boolean;
    processedImages: {
        url: string;
        publicId: string;
        index: number;
    }[];
    error?: string;
}

async function downloadImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        // Determine mime type from URL or default to jpeg
        const mimeType = url.includes('.png') ? 'image/png' : 'image/jpeg';

        return { data: base64, mimeType };
    } catch (error) {
        console.error('Error downloading image:', error);
        throw error;
    }
}

async function uploadToCloudinary(base64Image: string): Promise<{ url: string; publicId: string }> {
    try {
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${base64Image}`, {
            folder: 'autopost/empty-rooms',
            resource_type: 'image',
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

async function emptyRoom(imageUrl: string): Promise<{ url: string; publicId: string }> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        // Download the image
        const { data: base64Image, mimeType } = await downloadImageAsBase64(imageUrl);

        // Prepare the prompt for room emptying
        const prompt = [
            {
                text: "Remove all furniture, decorations, and objects from this room. Show only the empty space with walls, floors, ceiling, windows, and architectural features. Maintain the original lighting, perspective, and room dimensions. Keep the room's structure, colors, and architectural details exactly as they are."
            },
            {
                inlineData: {
                    mimeType,
                    data: base64Image,
                },
            },
        ];

        // Generate the empty room image using gemini-2.5-flash-image
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: prompt,
        });

        // Extract the generated image from the response
        let generatedImageBase64: string | null = null;

        // Type assertion to match the actual SDK response structure
        const responseData = response as any;
        if (responseData && responseData.parts) {
            for (const part of responseData.parts) {
                if (part.inlineData) {
                    generatedImageBase64 = part.inlineData.data;
                    break;
                }
            }
        }

        if (!generatedImageBase64) {
            throw new Error('No image generated in the response');
        }

        // Upload the generated image to Cloudinary
        const uploadResult = await uploadToCloudinary(generatedImageBase64);

        return uploadResult;
    } catch (error) {
        console.error('Error in emptyRoom:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // Rate limiting
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const identifier = forwardedFor || realIp || 'anonymous';

        const rateLimitResult = await checkRateLimit(identifier);

        if (!rateLimitResult.success) {
            const waitTime = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded',
                    message: `Please wait ${waitTime} seconds.`,
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                        'Retry-After': waitTime.toString(),
                    }
                }
            );
        }

        // Validate environment variables
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'Service configuration error: Missing GEMINI_API_KEY' },
                { status: 500 }
            );
        }

        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return NextResponse.json(
                { success: false, error: 'Service configuration error: Missing Cloudinary credentials' },
                { status: 500 }
            );
        }

        // Parse request body
        const body: EmptyRoomRequest = await request.json();
        const { imageUrls, selectedIndices } = body;

        // Validate input
        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No image URLs provided' },
                { status: 400 }
            );
        }

        if (!selectedIndices || !Array.isArray(selectedIndices) || selectedIndices.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No images selected for processing' },
                { status: 400 }
            );
        }

        // Validate selected indices
        for (const index of selectedIndices) {
            if (index < 0 || index >= imageUrls.length) {
                return NextResponse.json(
                    { success: false, error: `Invalid image index: ${index}` },
                    { status: 400 }
                );
            }
        }

        // Process selected images
        const processedImages: { url: string; publicId: string; index: number }[] = [];
        const errors: { index: number; error: string }[] = [];

        for (const index of selectedIndices) {
            try {
                const imageUrl = imageUrls[index];
                const result = await emptyRoom(imageUrl);
                processedImages.push({
                    ...result,
                    index,
                });
            } catch (error) {
                console.error(`Error processing image at index ${index}:`, error);
                errors.push({
                    index,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        // Return response
        const response: EmptyRoomResponse = {
            success: processedImages.length > 0,
            processedImages,
        };

        if (errors.length > 0) {
            response.error = `Failed to process ${errors.length} image(s): ${errors.map(e => `Index ${e.index}: ${e.error}`).join(', ')}`;
        }

        return NextResponse.json(response, {
            status: processedImages.length > 0 ? 200 : 500,
            headers: {
                'X-Processing-Time': `${Date.now() - startTime}ms`,
                'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            }
        });

    } catch (error) {
        console.error('Empty room API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to process images',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Empty Room API is running',
        usage: 'POST with { imageUrls: string[], selectedIndices: number[] }',
        model: 'gemini-2.5-flash-image',
    });
}
