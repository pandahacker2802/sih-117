"use strict";

const mongoose = require("mongoose");

const PROJECT_MEMBER_ROLES = {
  OWNER: "OWNER",
  MEMBER: "MEMBER",
  REVIEWER: "REVIEWER",
};

const projectMemberSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(PROJECT_MEMBER_ROLES),
      required: true,
      default: PROJECT_MEMBER_ROLES.MEMBER,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one membership record per user per project
projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });
projectMemberSchema.index({ userId: 1 });

const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema);

module.exports = ProjectMember;
