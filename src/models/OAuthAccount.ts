import mongoose, { Schema, Document } from 'mongoose';

export interface IOAuthAccount extends Document {
  userId: string;
  provider: string;
  providerId: string; // id dari provider (googleId)
  email: string;
  displayName: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  connectedAt: Date;
  updatedAt: Date;
}

const oauthAccountSchema = new Schema<IOAuthAccount>({
  userId: { type: String, required: true, index: true },
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
  email: { type: String, required: true },
  displayName: { type: String },
  picture: { type: String },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  connectedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index untuk pencarian cepat dan mencegah duplikasi link
oauthAccountSchema.index({ userId: 1, provider: 1 }, { unique: true });
oauthAccountSchema.index({ provider: 1, providerId: 1 });

export const OAuthAccount = mongoose.model<IOAuthAccount>('OAuthAccount', oauthAccountSchema);