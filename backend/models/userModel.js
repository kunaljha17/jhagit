const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase:true,
    trim:true,
    minLength:1,
    maxLength:30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  repositories: [
    {
      default: [],
      type: Schema.Types.ObjectId,
      ref: "Repository",
    },
  ],
  followedUsers: [
    {
      default: [],
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  starRepos: [
    {
      default: [],
      type: Schema.Types.ObjectId,
      ref: "Repository",
    },
  ],
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/dzffc9b1p/image/upload/v1785868989/user_kxdkwj.png",
  },
   isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },           // hashed OTP, never store plain
    otpExpires: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },       // failed verify attempts (rate limiting)
    otpLastSentAt: { type: Date, default: null },    // for resend cooldown
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
