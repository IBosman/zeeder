import { Router } from "express";
import { storage } from "../storage";

export const companyUsersRouter = Router();

// Get all users for a company
companyUsersRouter.get("/:companyId/users", async (req, res) => {
  try {
    const { companyId } = req.params;
    const companyIdNum = parseInt(companyId, 10);
    
    if (isNaN(companyIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID'
      });
    }

    const users = await storage.getUsersByCompanyId(companyIdNum);
    return res.status(200).json({
      success: true,
      users
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in GET /api/companies/:companyId/users:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching company users',
      error: error.message
    });
  }
});

// Assign a user to a company
companyUsersRouter.post("/:companyId/users/:userId", async (req, res) => {
  try {
    const { companyId, userId } = req.params;
    const companyIdNum = parseInt(companyId, 10);
    const userIdNum = parseInt(userId, 10);
    
    if (isNaN(companyIdNum) || isNaN(userIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID or user ID'
      });
    }

    // Check if user exists
    const user = await storage.getUser(userIdNum);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the user is already assigned to this company
    if (user.companyId === companyIdNum) {
      return res.status(409).json({
        success: false,
        message: 'User is already assigned to this company'
      });
    }

    // Check if the user is assigned to another company
    // Allow null or 0 company IDs (unassigned users)
    if (user.companyId !== null && user.companyId !== 0) {
      return res.status(409).json({
        success: false,
        message: 'User is already assigned to another company'
      });
    }

    const updatedUser = await storage.assignUserToCompany(companyIdNum, userIdNum);
    return res.status(201).json({
      success: true,
      user: updatedUser
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in POST /api/companies/:companyId/users/:userId:', error);
    return res.status(500).json({
      success: false,
      message: 'Error assigning user to company',
      error: error.message
    });
  }
});

// Remove a user from a company
companyUsersRouter.delete("/:companyId/users/:userId", async (req, res) => {
  try {
    const { companyId, userId } = req.params;
    const userIdNum = parseInt(userId, 10);
    
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check if user exists and belongs to the specified company
    const user = await storage.getUser(userIdNum);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Make sure the user belongs to the company we're trying to remove them from
    const companyIdNum = parseInt(companyId, 10);
    if (user.companyId !== companyIdNum) {
      return res.status(400).json({
        success: false,
        message: 'User does not belong to this company'
      });
    }

    const success = await storage.removeUserFromCompany(userIdNum);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to remove user from company'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User removed from company successfully'
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in DELETE /api/companies/:companyId/users/:userId:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing user from company',
      error: error.message
    });
  }
});
