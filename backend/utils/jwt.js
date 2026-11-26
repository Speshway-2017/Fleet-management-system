import jwt from 'jsonwebtoken';

const secret  = () => process.env.JWT_SECRET;
const expires = () => process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload) =>
  jwt.sign(payload, secret(), { expiresIn: expires() });

export const verifyToken = (token) =>
  jwt.verify(token, secret());
