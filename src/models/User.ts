import mongoose, { Schema, Document } from 'mongoose';

/**
 * User Interface
 * Defines the structure of a user document
 */
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
  // Methods
  isAccountLocked(): boolean;
  incLoginAttempts(): void;
  resetLoginAttempts(): void;
  toJSON(): object;
}

/**
 * User Schema
 * MongoDB collection schema for users
 */
const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      minlength: [3, 'Full name must be at least 3 characters'],
      maxlength: [100, 'Full name must not exceed 100 characters'],
      trim: true
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must not exceed 30 characters'],
      lowercase: true,
      match: [/^[a-z0-9_]*[0-9][a-z0-9_]*$/, 'Username must contain at least one digit and can only contain lowercase letters, numbers and underscore'],
      index: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ],
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [12, 'Password must be at least 12 characters'],
      select: false, // Never select password by default
      validate: {
        validator: function (v: string): boolean {
          // Check for uppercase letter
          if (!/[A-Z]/.test(v)) {
            return false;
          }
          // Check for lowercase letter
          if (!/[a-z]/.test(v)) {
            return false;
          }
          // Check for digit
          if (!/[0-9]/.test(v)) {
            return false;
          }
          // Check for special character
          if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)) {
            return false;
          }
          // Check for sequential characters (like 123, abc, etc)
          const sequentialPattern = /(.)\1{2,}|(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i;
          if (sequentialPattern.test(v)) {
            return false;
          }
          return true;
        },
        message: 'Password must contain uppercase, lowercase, digit, special character and cannot have sequential characters'
      }
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin'],
        message: 'Role must be student or admin'
      },
      default: 'student',
      index: true
    },
    avatar: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    isLocked: {
      type: Boolean,
      default: false,
      index: true
    },
    lockUntil: {
      type: Date,
      default: null
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lastLogin: {
      type: Date,
      default: null
    },
    lastLogout: {
      type: Date,
      default: null
    },
    activationCode: {
      type: String,
      default: null
    },
    activationExpire: {
      type: Date,
      default: null
    },
    resetToken: {
      type: String,
      default: null
    },
    resetExpire: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * INDEXES for performance optimization
 */
userSchema.index({ email: 1, isVerified: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isLocked: 1, lockUntil: 1 });

/**
 * METHODS
 */

/**
 * Check if account is locked
 */
userSchema.methods.isAccountLocked = function (): boolean {
  // If lockUntil has passed, unlock the account
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.isLocked = false;
    this.lockUntil = null;
    this.loginAttempts = 0;
    return false;
  }
  return this.isLocked;
};

/**
 * Increment login attempts
 */
userSchema.methods.incLoginAttempts = function (): void {
  this.loginAttempts += 1;

  // Lock account after 5 failed attempts
  if (this.loginAttempts >= 5) {
    this.isLocked = true;
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
};

/**
 * Reset login attempts
 */
userSchema.methods.resetLoginAttempts = function (): void {
  this.loginAttempts = 0;
  this.isLocked = false;
  this.lockUntil = null;
  this.lastLogin = new Date();
};

/**
 * HOOKS
 */

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetToken;
  delete userObject.activationCode;
  delete userObject.__v;
  return userObject;
};

/**
 * Export User Model
 */
export const User = mongoose.model<IUser>('User', userSchema);