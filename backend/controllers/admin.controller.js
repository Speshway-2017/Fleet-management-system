import { createManager as createManagerInRepo, getAllManagers, getManagerById } from '../repositories/admin.repository.js';
import { hashPassword } from '../utils/hashPassword.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getDashboard = async (_req, res) => {
  return sendSuccess(res, 200, { message: 'Admin dashboard ready' }, 'Dashboard loaded');
};

export const listManagers = async (_req, res, next) => {
  try {
    const managers = await getAllManagers();
    return sendSuccess(res, 200, managers, 'Fleet managers fetched');
  } catch (error) {
    next(error);
  }
};

export const createManager = async (req, res, next) => {
  try {
    const { name, email, password, phone, organization } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required');
    }

    const hashedPassword = await hashPassword(password);
    const manager = await createManagerInRepo({ name, email, password: hashedPassword, phone, organization });

    return sendSuccess(res, 201, { id: manager._id, name: manager.name, email: manager.email, role: manager.role }, 'Fleet manager created');
  } catch (error) {
    next(error);
  }
};

export const getManagerDetails = async (req, res, next) => {
  try {
    const manager = await getManagerById(req.params.id);
    if (!manager) return sendError(res, 404, 'Fleet manager not found');
    return sendSuccess(res, 200, manager, 'Fleet manager details fetched');
  } catch (error) {
    next(error);
  }
};
