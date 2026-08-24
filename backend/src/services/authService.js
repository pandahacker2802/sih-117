"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, PasswordResetToken } = require("../models");

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  return obj;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      employeeId: user.employeeId,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("Account is inactive");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  const token = generateToken(user);

  return { user: sanitizeUser(user), token };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await User.findByIdAndUpdate(userId, { passwordHash, isFirstLogin: false });
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    return;
  }

  await PasswordResetToken.deleteMany({ userId: user._id });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  await PasswordResetToken.create({
    userId: user._id,
    hashedToken,
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    used: false,
  });

  return { resetToken: rawToken, userId: user._id };
};

const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const record = await PasswordResetToken.findOne({
    hashedToken,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    throw new Error("Reset token is invalid or has expired");
  }

  const user = await User.findById(record.userId);

  if (!user) {
    throw new Error("User not found");
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await User.findByIdAndUpdate(user._id, { passwordHash, isFirstLogin: false });

  await PasswordResetToken.findByIdAndUpdate(record._id, { used: true });
};

module.exports = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
};
