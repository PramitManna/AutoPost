import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { deleteUserToken } from '@/lib/token-manager';

/**
 * POST /api/user/delete-data
 * Handles user data deletion requests (GDPR/CCPA compliance)
 * Meta will call this endpoint when users request data deletion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, signed_request } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Delete user from database
    const result = await User.deleteOne({ userId });
    
    // Also delete user token (logout)
    await deleteUserToken(userId);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json(
      {
        success: true,
        message: 'User data deleted successfully',
        url: `${baseUrl}/delete-data`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user data:', error);
    return NextResponse.json(
      { error: 'Failed to delete user data' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/delete-data
 * Returns deletion status/confirmation
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Data deletion endpoint. Send POST request with userId.',
    documentation: 'https://auto-post-mu.vercel.app/delete-data'
  });
}
