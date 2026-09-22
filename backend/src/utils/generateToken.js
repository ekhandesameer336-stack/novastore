import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'dev_jwt_secret_key_987654321_ecommerce_app',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};
