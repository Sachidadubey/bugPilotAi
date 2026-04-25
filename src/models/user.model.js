import mongoose from "mongoose";
import bcrypt   from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    subscription: { type: String, enum: ["free", "pro"], default: "free" },

    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String, default: null, select: false },

    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  
    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },
    phone: {
      type: String,
      default: "",
    },
    avatar: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
  
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: "",
    },
    bannedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }

);

userSchema.index({ role: 1, subscription: 1 });

// async hook — next parameter bilkul nahi, sirf promise return karo
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// validateBeforeSave: false — infinite loop rokta hai
// kyunki save() dobara pre-save hook trigger karta hai
userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS     = 5;
  const LOCK_DURATION_MS = 15 * 60 * 1000;

  this.loginAttempts += 1;

  if (this.loginAttempts >= MAX_ATTEMPTS) {
    this.lockUntil     = new Date(Date.now() + LOCK_DURATION_MS);
    this.loginAttempts = 0;
  }

  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil     = null;
  await this.save({ validateBeforeSave: false });
};

export default mongoose.model("User", userSchema);