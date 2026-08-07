const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
require("dotenv").config();
const {
  generateOtp,
  hashOtp,
  getOtpExpiry,
  canResend,
} = require("../config/otp");
const { sendOtpEmail } = require("../config/mailer");

const MAX_OTP_ATTEMPTS = 5;

const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (password.length > 30) {
    return "Password cannot exceed 30 characters.";
  }
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/~`])/;
  if (!passwordRegex.test(password)) {
    return "Password must contain at least one uppercase letter, one digit, and one special character.";
  }
  return null;
};

const signup = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      // If they exist but never verified, don't hard-block — let them re-request an OTP
      if (existingUser && !existingUser.isVerified) {
        return res.status(409).json({
          message:
            "Account exists but is not verified. Use /resend-otp to get a new code.",
        });
      }
      return res.status(400).json({ message: "User or email already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOtp();

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
      isVerified: false,
      otp: hashOtp(otp),
      otpExpires: getOtpExpiry(),
      otpLastSentAt: new Date(),
    });

    await newUser.save();

    await sendOtpEmail(newUser.email, otp);

    // No JWT issued yet — user isn't verified, so they can't log in until they confirm the OTP
    res.status(201).json({
      message: "Signup successful. Check your email for the verification code.",
      userId: newUser._id,
    });
  } catch (err) {
    console.error("Error during signUp:", err.message);
    res.status(500).send("Server error");
  }
};

// POST /verify-otp   { email, otp }
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res
        .status(429)
        .json({ message: "Too many attempts. Request a new OTP." });
    }

    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    if (hashOtp(otp) !== user.otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    // Now that they're verified, issue the JWT — same pattern as your original signup
    const jwtSecret =
      process.env.JWT_SECRET || process.env.JWT_SECERT_KEY || "secretkey";
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" });

    res.status(200).json({
      message: "Email verified successfully",
      token,
      userId: user._id,
    });
  } catch (err) {
    console.error("Error during OTP verification:", err.message);
    res.status(500).send("Server error");
  }
};

// POST /resend-otp   { email }
const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    if (!canResend(user.otpLastSentAt)) {
      return res
        .status(429)
        .json({ message: "Please wait before requesting another OTP" });
    }

    const otp = generateOtp();
    user.otp = hashOtp(otp);
    user.otpExpires = getOtpExpiry();
    user.otpLastSentAt = new Date();
    user.otpAttempts = 0;
    await user.save();

    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: "A new OTP has been sent to your email" });
  } catch (err) {
    console.error("Error during OTP resend:", err.message);
    res.status(500).send("Server error");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email before logging in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const jwtSecret =
      process.env.JWT_SECRET || process.env.JWT_SECERT_KEY || "secretkey";
    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).send("Server error");
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).send("Server error");
  }
};

const getUserProfile = async (req, res) => {
  const currentID = req.params.id;
  try {
    const user = await User.findById(currentID).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not Found!" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching profile by ID:", err.message);
    res.status(500).send("Server error");
  }
};

const updateUserProfile = async (req, res) => {
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    const user = await User.findById(currentID);
    if (!user) {
      return res.status(404).json({ message: "User not Found!" });
    }

    if (email) {
      user.email = email;
    }
    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (err) {
    console.error("Error updating profile:", err.message);
    res.status(500).send("Server error");
  }
};

const ALLOWED_AVATAR_URLS = [
  "https://res.cloudinary.com/dzffc9b1p/image/upload/v1785868809/hacker_cpgvxj.png",
  "https://res.cloudinary.com/dzffc9b1p/image/upload/v1785868809/man_mzxes8.png",
  "https://res.cloudinary.com/dzffc9b1p/image/upload/v1785868809/woman_qqeb3m.png",
  "https://res.cloudinary.com/dzffc9b1p/image/upload/v1785868809/girl_zizow9.png",
];

const updateAvatar = async (req, res) => {
  const { avatarUrl } = req.body;
  try {
    if (!avatarUrl || !ALLOWED_AVATAR_URLS.includes(avatarUrl)) {
      return res.status(400).json({ message: "Invalid avatar selection" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error while updating avatar:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUserProfile = async (req, res) => {
  const currentID = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(currentID);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not Found!" });
    }
    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("Error deleting profile:", err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  getAllUser,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  updateAvatar,
  deleteUserProfile,
  verifyOtp,
  resendOtp,
};
