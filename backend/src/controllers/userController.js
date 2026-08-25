"use strict";

const { userService } = require("../services");

const createUser = async (req, res, next) => {
  try {
    const { employeeId, name, email, department, role } = req.body;
    const user = await userService.createUser(
      { employeeId, name, email, department, role },
      req.user._id
    );

    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const filters = {
      isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
      role: req.query.role,
      department: req.query.department,
    };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await userService.getUsers(filters, options);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, department, role } = req.body;
    const user = await userService.updateUser(req.params.id, { name, email, department, role }, req.user._id);

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const activateUser = async (req, res, next) => {
  try {
    const user = await userService.activateUser(req.params.id, req.user._id);

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const user = await userService.deactivateUser(req.params.id, req.user._id);

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, getUserById, getUsers, updateUser, activateUser, deactivateUser };
