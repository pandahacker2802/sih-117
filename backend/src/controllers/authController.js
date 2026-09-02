"use strict";

const { authService } = require("../services");

const login = async (req, res, next) => {
  try {
    const { email, employeeId, password } = req.body;
    const result = await authService.login({ email, employeeId, password }, req.ip);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user._id, { currentPassword, newPassword });

    return res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword({ email });

    return res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword({ token, newPassword });

    return res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, changePassword, forgotPassword, resetPassword };
