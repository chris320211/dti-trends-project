export interface ILoginStats {
  userId: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}
