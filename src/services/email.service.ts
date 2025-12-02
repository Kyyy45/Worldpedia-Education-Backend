import { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { getEmailTransporter } from '../config/email';
import { logger } from '../utils/logger';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private templateCache = new Map<string, handlebars.TemplateDelegate>();

  async init(): Promise<void> {
    if (!this.transporter) {
      this.transporter = await getEmailTransporter();
      logger.info('✅ Email service initialized (Direct Mode)');
    }
  }

  private async loadTemplate(templateName: string): Promise<handlebars.TemplateDelegate> {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }
    try {
      const templatePath = path.join(__dirname, `../templates/email/${templateName}.template.html`);
      const content = await fs.readFile(templatePath, 'utf-8');
      const compiled = handlebars.compile(content);
      this.templateCache.set(templateName, compiled);
      return compiled;
    } catch (error) {
      logger.error(`Failed to load template ${templateName}:`, error);
      throw error;
    }
  }

  private async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    const template = await this.loadTemplate(templateName);
    return template(data);
  }

  // Method utama untuk kirim email langsung
  async sendEmail(payload: EmailPayload): Promise<string> {
    try {
      await this.init();
      const result = await this.transporter!.sendMail(payload);
      logger.info(`✅ Email sent to ${payload.to} (Message ID: ${result.messageId})`);
      return result.messageId;
    } catch (error) {
      logger.error(`❌ Failed to send email to ${payload.to}:`, error);
      // Jangan throw error agar flow aplikasi utama (misal register) tidak gagal cuma karena email gagal
      return ''; 
    }
  }

  // --- Wrapper Methods (Semuanya panggil sendEmail langsung) ---

  async sendVerificationEmail(email: string, fullName: string, activationCode: string, verificationLink: string) {
    const html = await this.renderTemplate('verification', { fullName, activationCode, verificationLink });
    // Tidak perlu await jika ingin user tidak menunggu email terkirim
    this.sendEmail({ to: email, subject: 'Verify Your Email', html }); 
    return 'Email sending started';
  }

  async sendPasswordResetEmail(email: string, fullName: string, resetLink: string, resetToken: string) {
    const html = await this.renderTemplate('password-reset', { fullName, resetLink, resetToken });
    await this.sendEmail({ to: email, subject: 'Reset Your Password', html });
    return 'Email sent';
  }

  async sendEnrollmentConfirmationEmail(email: string, fullName: string, courseName: string, courseLevel: string, instructorName: string, duration: string, courseLink: string) {
    const html = await this.renderTemplate('enrollment-confirmation', { fullName, courseName, courseLevel, instructorName, duration, courseLink });
    this.sendEmail({ to: email, subject: `Welcome to ${courseName}`, html }); // Fire and forget
    return 'Email sending started';
  }

  async sendPaymentReceiptEmail(email: string, fullName: string, courseName: string, amount: string, transactionId: string, paymentMethod: string, paymentStatus: string, paymentDate: string) {
    const html = await this.renderTemplate('payment-receipt', { fullName, courseName, amount, transactionId, paymentMethod, paymentStatus, paymentDate });
    this.sendEmail({ to: email, subject: 'Payment Receipt', html });
    return 'Email sending started';
  }

  async sendCertificateIssuedEmail(email: string, fullName: string, courseName: string, serialNumber: string, issueDate: string, downloadLink: string) {
    const html = await this.renderTemplate('certificate-issued', { fullName, courseName, serialNumber, issueDate, downloadLink });
    this.sendEmail({ to: email, subject: `Congratulations! Your Certificate`, html });
    return 'Email sending started';
  }

  async sendWelcomeEmail(email: string, fullName: string, dashboardLink: string) {
    const html = await this.renderTemplate('welcome', { fullName, dashboardLink });
    this.sendEmail({ to: email, subject: 'Welcome to Worldpedia Education!', html });
    return 'Email sending started';
  }

  // Fitur ini mungkin akan lemot tanpa Redis, tapi tetap bisa jalan untuk jumlah kecil
  async sendBulkEmail(recipients: string[], subject: string, html: string) {
    logger.info(`Starting bulk email to ${recipients.length} recipients...`);
    // Kirim satu per satu secara paralel tapi tanpa memblokir proses utama
    recipients.forEach(email => {
      this.sendEmail({ to: email, subject, html });
    });
    return [];
  }
}

export default new EmailService();