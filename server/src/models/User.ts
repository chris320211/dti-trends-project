export interface IUser {
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
