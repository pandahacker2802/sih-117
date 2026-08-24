"use strict";

const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    hashedToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

passwordResetTokenSchema.index({ userId: 1, used: 1 });

const PasswordResetToken = mongoose.model("PasswordResetToken", passwordResetTokenSchema);

module.exports = PasswordResetToken;
