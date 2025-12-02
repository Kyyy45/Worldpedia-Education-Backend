import { Request, Response } from "express";
import emailService from "../services/email.service";
import { successResponse, errorResponse } from "../utils/response";
import { logger } from "../utils/logger";

export class EmailController {
  /**
   * Send test email
   */
  async sendTestEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json(errorResponse("Email address is required"));
        return;
      }

      const messageId = await emailService.sendEmail({
        to: email,
        subject: "Test Email - Worldpedia Education",
        html: "<p>This is a test email from Worldpedia Education platform.</p>",
        text: "This is a test email from Worldpedia Education platform.",
      });

      res
        .status(200)
        .json(successResponse({ messageId }, "Test email sent successfully"));
    } catch (error) {
      logger.error("Error sending test email:", error);
      res.status(500).json(errorResponse("Failed to send test email"));
    }
  }
}

export default new EmailController();
