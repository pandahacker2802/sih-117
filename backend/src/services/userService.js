"use strict";

const bcrypt = require("bcryptjs");
const { User } = require("../models");
const auditService = require("./auditService");

const BCRYPT_ROUNDS = 12;
const ALLOWED_UPDATE_FIELDS = ["name", "email", "department", "role"];

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  return obj;
};

const createUser = async ({ employeeId, name, email, department, role }, createdById) => {
  const existingEmployee = await User.findOne({ employeeId });

  if (existingEmployee) {
    throw new Error("Employee ID already exists");
  }

  const existingEmail = await User.findOne({ email: email.toLowerCase() });

  if (existingEmail) {
    throw new Error("Email already exists");
  }

  const defaultPassword = `${employeeId}@Change123`;
  const passwordHash = await bcrypt.hash(defaultPassword, BCRYPT_ROUNDS);

  const user = await User.create({
    employeeId,
    name,
    email: email.toLowerCase(),
    department,
    role,
    passwordHash,
    isActive: true,
    isFirstLogin: true,
    createdBy: createdById || null,
  });

  auditService.createAuditLog({
    userId: createdById,
    action: "USER_CREATED",
    resourceType: "User",
    resourceId: user._id,
    metadata: { employeeId, role },
  }).catch(console.error);

  return sanitizeUser(user);
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const getUsers = async (filters = {}, options = {}) => {
  const query = {};

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.department) {
    query.department = filters.department;
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query).select("-passwordHash").skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  return { users, total, page, limit };
};

const updateUser = async (userId, updates, actorId) => {
  const sanitized = {};

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (updates[field] !== undefined) {
      sanitized[field] = updates[field];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    throw new Error("No valid fields to update");
  }

  if (sanitized.email) {
    sanitized.email = sanitized.email.toLowerCase();

    const conflict = await User.findOne({ email: sanitized.email, _id: { $ne: userId } });

    if (conflict) {
      throw new Error("Email already exists");
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: sanitized },
    { new: true, runValidators: true }
  ).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  const action = sanitized.role ? "ROLE_CHANGED" : "USER_UPDATED";

  auditService.createAuditLog({
    userId: actorId,
    action,
    resourceType: "User",
    resourceId: userId,
    metadata: sanitized.role ? { newRole: sanitized.role } : { updatedFields: Object.keys(sanitized) },
  }).catch(console.error);

  return user;
};

const activateUser = async (userId, actorId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive: true } },
    { new: true }
  ).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  auditService.createAuditLog({
    userId: actorId,
    action: "USER_UPDATED",
    resourceType: "User",
    resourceId: userId,
    metadata: { isActive: true },
  }).catch(console.error);

  return user;
};

const deactivateUser = async (userId, actorId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive: false } },
    { new: true }
  ).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  auditService.createAuditLog({
    userId: actorId,
    action: "USER_DISABLED",
    resourceType: "User",
    resourceId: userId,
    metadata: { isActive: false },
  }).catch(console.error);

  return user;
};

module.exports = {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  activateUser,
  deactivateUser,
};
