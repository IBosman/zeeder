import { Router } from "express";
import { storage } from "../storage";

export const companyVoicesRouter = Router();

// NOTE: The GET endpoint for company voices has been moved to routes.ts
// to allow non-admin users to access it. The implementation below is kept
// for reference but is no longer used.

// Assign a voice to a company
companyVoicesRouter.post("/:companyId/voices/:voiceId", async (req, res) => {
  try {
    const { companyId, voiceId } = req.params;
    const companyIdNum = parseInt(companyId, 10);
    
    if (isNaN(companyIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID'
      });
    }

    // Check if voice exists
    const voice = await storage.getVoiceById(voiceId);
    if (!voice) {
      return res.status(404).json({
        success: false,
        message: 'Voice not found'
      });
    }

    // Check if the voice is already assigned to the company
    const companyVoices = await storage.getCompanyVoices(companyIdNum);
    if (companyVoices.some(v => v.voiceId === voiceId)) {
      return res.status(409).json({
        success: false,
        message: 'Voice is already assigned to this company'
      });
    }

    const companyVoice = await storage.assignVoiceToCompany(companyIdNum, voiceId);
    return res.status(201).json({
      success: true,
      companyVoice
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in POST /api/companies/:companyId/voices/:voiceId:', error);
    return res.status(500).json({
      success: false,
      message: 'Error assigning voice to company',
      error: error.message
    });
  }
});

// Remove a voice from a company
companyVoicesRouter.delete("/:companyId/voices/:voiceId", async (req, res) => {
  try {
    const { companyId, voiceId } = req.params;
    const companyIdNum = parseInt(companyId, 10);
    
    if (isNaN(companyIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID'
      });
    }

    const success = await storage.removeVoiceFromCompany(companyIdNum, voiceId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Voice not found for this company'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Voice removed from company successfully'
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in DELETE /api/companies/:companyId/voices/:voiceId:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing voice from company',
      error: error.message
    });
  }
});
