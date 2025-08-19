// ===== src/lib/payments/kazkom.ts =====
import crypto from 'crypto'
import { env } from '@/lib/env'
import { structuredLogger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

interface PaymentRequest {
  amount: number
  currency: string
  orderId: string
  description: string
  returnUrl: string
  failUrl: string
  language: string
  email?: string
  phone?: string
}

interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  formData?: Record<string, string>
  error?: string
}

export class KazkomPaymentService {
  private readonly merchantId = env.KAZKOM_MERCHANT_ID
  private readonly secretKey = env.KAZKOM_SECRET_KEY
  private readonly gatewayUrl = env.KAZKOM_GATEWAY_URL || 'https://3dsec.sberbank.kz/payment/rest'

  async createPayment(params: PaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentData = {
        userName: this.merchantId,
        password: this.secretKey,
        orderNumber: params.orderId,
        amount: params.amount * 100, // Convert to tenge minor units
        currency: '398', // KZT currency code
        returnUrl: params.returnUrl,
        failUrl: params.failUrl,
        description: params.description,
        language: params.language === 'KK' ? 'kk' : 'ru',
        ...(params.email && { email: params.email }),
        ...(params.phone && { phone: params.phone }),
      }

      const response = await fetch(`${this.gatewayUrl}/register.do`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(paymentData).toString(),
      })

      const result = await response.json()

      if (result.errorCode === '0' && result.orderId) {
        structuredLogger.info('Payment created successfully', {
          orderId: params.orderId,
          amount: params.amount,
          paymentId: result.orderId
        })

        return {
          success: true,
          paymentUrl: result.formUrl,
          formData: {
            orderId: result.orderId,
            sessionId: result.sessionId || '',
          }
        }
      } else {
        structuredLogger.error('Payment creation failed', new Error(result.errorMessage), {
          orderId: params.orderId,
          errorCode: result.errorCode
        })

        return {
          success: false,
          error: result.errorMessage || 'Payment creation failed'
        }
      }
    } catch (error) {
      structuredLogger.error('Payment service error', error as Error, params)
      return {
        success: false,
        error: 'Payment service temporarily unavailable'
      }
    }
  }

  async verifyPayment(orderId: string): Promise<{
    success: boolean
    status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'
    amount?: number
    currency?: string
    error?: string
  }> {
    try {
      const response = await fetch(`${this.gatewayUrl}/getOrderStatusExtended.do`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          userName: this.merchantId,
          password: this.secretKey,
          orderId,
        }).toString(),
      })

      const result = await response.json()

      if (result.errorCode === '0') {
        const statusMap: Record<number, 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'> = {
          0: 'PENDING',
          1: 'PENDING', // Pre-authorized
          2: 'PAID',     // Paid
          3: 'CANCELLED',
          4: 'FAILED',
          5: 'FAILED',   // Authorization failed
          6: 'CANCELLED' // Cancelled
        }

        const status = statusMap[result.orderStatus] || 'FAILED'

        return {
          success: true,
          status,
          amount: result.amount ? result.amount / 100 : undefined,
          currency: 'KZT'
        }
      } else {
        return {
          success: false,
          status: 'FAILED',
          error: result.errorMessage
        }
      }
    } catch (error) {
      structuredLogger.error('Payment verification error', error as Error, { orderId })
      return {
        success: false,
        status: 'FAILED',
        error: 'Verification failed'
      }
    }
  }

  async refundPayment(orderId: string, amount?: number): Promise<{
    success: boolean
    refundId?: string
    error?: string
  }> {
    try {
      const refundData: any = {
        userName: this.merchantId,
        password: this.secretKey,
        orderId,
      }

      if (amount) {
        refundData.amount = amount * 100 // Convert to minor units
      }

      const response = await fetch(`${this.gatewayUrl}/refund.do`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(refundData).toString(),
      })

      const result = await response.json()

      if (result.errorCode === '0') {
        structuredLogger.info('Refund processed successfully', {
          orderId,
          amount,
          refundId: result.refundId
        })

        return {
          success: true,
          refundId: result.refundId
        }
      } else {
        structuredLogger.error('Refund failed', new Error(result.errorMessage), {
          orderId,
          amount,
          errorCode: result.errorCode
        })

        return {
          success: false,
          error: result.errorMessage || 'Refund failed'
        }
      }
    } catch (error) {
      structuredLogger.error('Refund service error', error as Error, { orderId, amount })
      return {
        success: false,
        error: 'Refund service temporarily unavailable'
      }
    }
  }
}

export const paymentService = new KazkomPaymentService()