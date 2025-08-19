// ===== src/lib/email/index.ts =====
// TODO: Install nodemailer when email functionality is needed
// import nodemailer from 'nodemailer'
import { env } from '@/lib/env'
import { structuredLogger } from '@/lib/logger'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Mock transporter interface for compilation
interface Transporter {
  sendMail(options: any): Promise<any>
}

class MockTransporter implements Transporter {
  async sendMail(options: any): Promise<any> {
    throw new Error('Email service not configured. Please install nodemailer and configure SMTP settings.')
  }
}

class EmailService {
  private transporter: Transporter

  constructor() {
    // Use mock transporter until nodemailer is installed
    this.transporter = new MockTransporter()
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"KazRPG" <${env.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      structuredLogger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      })
    } catch (error) {
      structuredLogger.error('Failed to send email', error as Error, {
        to: options.to,
        subject: options.subject,
      })
      throw error
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${env.APP_URL}/auth/verify?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Подтвердите ваш email - KazRPG</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed;">KazRPG</h1>
          </div>
          
          <h2>Добро пожаловать в KazRPG!</h2>
          
          <p>Спасибо за регистрацию на нашей платформе. Для завершения регистрации, пожалуйста, подтвердите ваш email адрес.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Подтвердить Email
            </a>
          </div>
          
          <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="font-size: 14px; color: #666;">
            Если вы не регистрировались на KazRPG, просто проигнорируйте это письмо.
          </p>
        </body>
      </html>
    `

    await this.sendEmail({
      to: email,
      subject: 'Подтвердите ваш email - KazRPG',
      html,
      text: `Подтвердите ваш email перейдя по ссылке: ${verificationUrl}`,
    })
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${env.APP_URL}/auth/reset-password?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Сброс пароля - KazRPG</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed;">KazRPG</h1>
          </div>
          
          <h2>Сброс пароля</h2>
          
          <p>Вы запросили сброс пароля для вашего аккаунта KazRPG.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Сбросить пароль
            </a>
          </div>
          
          <p>Ссылка действительна в течение 1 часа.</p>
          
          <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="font-size: 14px; color: #666;">
            Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
          </p>
        </body>
      </html>
    `

    await this.sendEmail({
      to: email,
      subject: 'Сброс пароля - KazRPG',
      html,
      text: `Сбросьте ваш пароль перейдя по ссылке: ${resetUrl}`,
    })
  }

  async sendGameConfirmationEmail(
    email: string,
    playerName: string,
    gameTitle: string,
    gameDate: Date,
    gmName: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Подтверждение записи на игру - KazRPG</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed;">KazRPG</h1>
          </div>
          
          <h2>Запись на игру подтверждена!</h2>
          
          <p>Привет, ${playerName}!</p>
          
          <p>Ваша запись на игру была подтверждена:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${gameTitle}</h3>
            <p><strong>Мастер:</strong> ${gmName}</p>
            <p><strong>Дата и время:</strong> ${gameDate.toLocaleString('ru-RU')}</p>
          </div>
          
          <p>Мастер свяжется с вами дополнительно для уточнения деталей.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.APP_URL}/dashboard" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Перейти в личный кабинет
            </a>
          </div>
          
          <p>Удачной игры!</p>
        </body>
      </html>
    `

    await this.sendEmail({
      to: email,
      subject: `Подтверждение записи на игру "${gameTitle}"`,
      html,
    })
  }
}

export const emailService = new EmailService()
export const sendVerificationEmail = emailService.sendVerificationEmail.bind(emailService)
export const sendPasswordResetEmail = emailService.sendPasswordResetEmail.bind(emailService)
export const sendGameConfirmationEmail = emailService.sendGameConfirmationEmail.bind(emailService)
