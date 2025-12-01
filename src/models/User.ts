import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  avatar?: string;
  isVerified: boolean;
  isLocked: boolean;
  lockUntil?: Date | null;
  loginAttempts: number;
  lastLogin?: Date;
  lastLogout?: Date;
  activationCode?: string;
  activationExpire?: Date;
  resetToken?: string;
  resetExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
  isAccountLocked(): boolean;
  incLoginAttempts(): void;
  resetLoginAttempts(): void;
  toJSON(): object;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      minlength: 3,
      maxlength: 100,
      trim: true
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true, // Otomatis membuat index
      minlength: 3,
      maxlength: 30,
      lowercase: true,
      match: [/^[a-z0-9_]*[0-9][a-z0-9_]*$/, 'Invalid username format']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Otomatis membuat index
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 12,
      select: false,
      validate: {
        validator: function (v: string): boolean {
          if (!/[A-Z]/.test(v)) return false;
          if (!/[a-z]/.test(v)) return false;
          if (!/[0-9]/.test(v)) return false;
          if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)) return false;
          const sequentialPattern = /(.)\1{2,}|(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i;
          return !sequentialPattern.test(v);
        },
        message: 'Password does not meet complexity requirements'
      }
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    avatar: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    lockUntil: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null },
    lastLogout: { type: Date, default: null },
    activationCode: { type: String, default: null },
    activationExpire: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetExpire: { type: Date, default: null }
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1, isVerified: 1 });
// userSchema.index({ username: 1 }); <--- DIHAPUS AGAR TIDAK DUPLIKAT
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isLocked: 1, lockUntil: 1 });

userSchema.methods.isAccountLocked = function (): boolean {
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.isLocked = false;
    this.lockUntil = null;
    this.loginAttempts = 0;
    return false;
  }
  return this.isLocked;
};

userSchema.methods.incLoginAttempts = function (): void {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.isLocked = true;
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
};

userSchema.methods.resetLoginAttempts = function (): void {
  this.loginAttempts = 0;
  this.isLocked = false;
  this.lockUntil = null;
  this.lastLogin = new Date();
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetToken;
  delete userObject.activationCode;
  delete userObject.__v;
  return userObject;
};

export const User = mongoose.model<IUser>('User', userSchema);