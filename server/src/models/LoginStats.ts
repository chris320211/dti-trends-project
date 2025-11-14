import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginStats extends Document {
  userId: mongoose.Types.ObjectId;
  firebaseUid: string;
  loginTime: Date;
  loginMethod: 'email' | 'google' | 'other';
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  success: boolean;
  errorMessage?: string;
}

const LoginStatsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    loginMethod: {
      type: String,
      enum: ['email', 'google', 'other'],
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    device: {
      type: String,
    },
    browser: {
      type: String,
    },
    os: {
      type: String,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

LoginStatsSchema.index({ userId: 1, loginTime: -1 });
LoginStatsSchema.index({ firebaseUid: 1, loginTime: -1 });
LoginStatsSchema.index({ loginTime: -1 });

export default mongoose.model<ILoginStats>('LoginStats', LoginStatsSchema);
