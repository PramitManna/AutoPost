import axios from 'axios';
import { connectToDatabase } from './mongodb';
import User, { IUser } from '../models/User';

/**
 * Generate a unique user ID based on IP address
 * In production, you might want to use sessions or proper authentication
 */
export function generateUserId(req: Request): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Create a consistent hash
  return `user_${ip.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Store or update user's Meta tokens in database
 */
export async function storeUserToken(
  userId: string,
  tokenData: {
    accessToken: string;
    pageId?: string;
    pageName?: string;
    igBusinessId?: string;
    userName?: string;
    email?: string;
  }
): Promise<IUser> {
  await connectToDatabase();

  // Calculate token expiry (60 days from now)
  const tokenExpiry = new Date();
  tokenExpiry.setDate(tokenExpiry.getDate() + 60);

  // Upsert (update if exists, create if not)
  const user = await User.findOneAndUpdate(
    { userId },
    {
      ...tokenData,
      tokenExpiry,
      updatedAt: new Date(),
    },
    {
      upsert: true,
      new: true, // Return the updated document
      setDefaultsOnInsert: true,
    }
  );

  console.log(`✅ Token stored for user: ${userId}`);
  return user;
}

/**
 * Get user's valid token from database
 * Returns null if token is expired or user not found
 */
export async function getUserToken(userId: string): Promise<IUser | null> {
  await connectToDatabase();

  const user = await User.findOne({ userId });

  if (!user) {
    console.log(`⚠️ No user found with ID: ${userId}`);
    return null;
  }

  // Check if token is expired
  const now = new Date();
  if (user.tokenExpiry < now) {
    console.log(`⚠️ Token expired for user: ${userId}`);
    // Optionally refresh token here or return null
    return null;
  }

  console.log(`✅ Valid token found for user: ${userId}`);
  return user;
}

/**
 * Refresh an expired long-lived token
 * Note: Meta allows refreshing tokens before they expire
 */
export async function refreshUserToken(userId: string): Promise<IUser | null> {
  await connectToDatabase();

  const user = await User.findOne({ userId });
  if (!user) {
    console.log(`⚠️ No user found for token refresh: ${userId}`);
    return null;
  }

  try {
    // Exchange old token for new long-lived token
    const response = await axios.get(
      'https://graph.facebook.com/v21.0/oauth/access_token',
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: user.accessToken,
        },
      }
    );

    const newToken = response.data.access_token;
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 60);

    // Update the token in database
    user.accessToken = newToken;
    user.tokenExpiry = tokenExpiry;
    await user.save();

    console.log(`✅ Token refreshed for user: ${userId}`);
    return user;
  } catch (error) {
    console.error(`❌ Token refresh failed for user: ${userId}`, error);
    return null;
  }
}

/**
 * Get valid token with automatic refresh if needed
 * This is the main function to use in API routes
 */
export async function getValidToken(userId: string): Promise<IUser | null> {
  let user = await getUserToken(userId);

  if (!user) {
    return null;
  }

  // Check if token expires soon (within 7 days) and refresh proactively
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  if (user.tokenExpiry < sevenDaysFromNow) {
    console.log(`🔄 Token expiring soon, refreshing for user: ${userId}`);
    const refreshedUser = await refreshUserToken(userId);
    if (refreshedUser) {
      user = refreshedUser;
    }
  }

  return user;
}

/**
 * Delete user token from database (logout)
 */
export async function deleteUserToken(userId: string): Promise<boolean> {
  await connectToDatabase();

  const result = await User.deleteOne({ userId });
  console.log(`✅ Token deleted for user: ${userId}`);
  return result.deletedCount > 0;
}
