import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'email' | 'google' | 'other';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  loginCount: number;
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['email', 'google', 'other'],
      default: 'email',
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ firebaseUid: 1 });

export default mongoose.model<IUser>('User', UserSchema);
