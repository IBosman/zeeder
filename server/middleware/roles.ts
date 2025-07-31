import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // In demo mode, always allow
  if (process.env.DEMO_MODE === 'true') {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

export const isCompanyAdmin = (req: Request, res: Response, next: NextFunction) => {
  // In demo mode, always allow
  if (process.env.DEMO_MODE === 'true') {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Allow both admin and company admin roles
  if (req.user.role !== 'admin' && req.user.role !== 'company_admin') {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  next();
};
