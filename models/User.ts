import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  userId: string; // Unique identifier (IP-based or session-based)
  userName?: string;
  email?: string;
  accessToken: string; // Long-lived token (60 days)
  tokenExpiry: Date;
  pageId?: string;
  pageName?: string;
  igBusinessId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
    },
    accessToken: {
      type: String,
      required: true,
    },
    tokenExpiry: {
      type: Date,
      required: true,
    },
    pageId: {
      type: String,
    },
    pageName: {
      type: String,
    },
    igBusinessId: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compound index for faster queries
UserSchema.index({ userId: 1, tokenExpiry: 1 });

// Delete the model from mongoose models if it already exists (for hot reloads)
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
