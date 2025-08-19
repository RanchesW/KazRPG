// ===== src/lib/websocket/server.ts =====
import { Server, Socket } from 'socket.io'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { getToken } from 'next-auth/jwt'
import { structuredLogger } from '@/lib/logger'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

interface SocketUser {
  id: string
  username: string
  isGM: boolean
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser
}

class WebSocketManager {
  private io: Server | null = null
  private userSockets = new Map<string, string>() // userId -> socketId
  private gameRooms = new Map<string, Set<string>>() // gameId -> Set<socketId>

  async initialize(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL,
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    })

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]
        
        if (!token) {
          return next(new Error('Authentication error'))
        }

        // Verify JWT token (you'd implement this based on your auth system)
        const decoded = await getToken({ 
          req: { headers: { authorization: `Bearer ${token}` } } as any,
          secret: process.env.NEXTAUTH_SECRET 
        })

        if (!decoded) {
          return next(new Error('Invalid token'))
        }

        socket.user = {
          id: decoded.sub!,
          username: decoded.username as string,
          isGM: decoded.isGM as boolean,
        }

        next()
      } catch (error) {
        structuredLogger.error('Socket authentication error', error as Error)
        next(new Error('Authentication failed'))
      }
    })

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket)
    })

    structuredLogger.info('WebSocket server initialized')
  }

  private handleConnection(socket: AuthenticatedSocket) {
    const user = socket.user!
    
    structuredLogger.info('User connected via WebSocket', {
      userId: user.id,
      username: user.username,
      socketId: socket.id
    })

    // Store user socket mapping
    this.userSockets.set(user.id, socket.id)

    // Join user to their personal room
    socket.join(`user:${user.id}`)

    // Handle joining game rooms
    socket.on('join-game', (gameId: string) => {
      this.joinGameRoom(socket, gameId)
    })

    socket.on('leave-game', (gameId: string) => {
      this.leaveGameRoom(socket, gameId)
    })

    // Handle real-time booking events
    socket.on('book-game', async (data: { gameId: string; playerCount: number; message?: string }) => {
      await this.handleGameBooking(socket, data)
    })

    // Handle chat messages
    socket.on('game-message', (data: { gameId: string; message: string; type?: string }) => {
      this.handleGameMessage(socket, data)
    })

    // Handle typing indicators
    socket.on('typing-start', (gameId: string) => {
      socket.to(`game:${gameId}`).emit('user-typing', {
        userId: user.id,
        username: user.username
      })
    })

    socket.on('typing-stop', (gameId: string) => {
      socket.to(`game:${gameId}`).emit('user-stopped-typing', {
        userId: user.id
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket)
    })
  }

  private joinGameRoom(socket: AuthenticatedSocket, gameId: string) {
    const user = socket.user!
    const roomName = `game:${gameId}`
    
    socket.join(roomName)
    
    if (!this.gameRooms.has(gameId)) {
      this.gameRooms.set(gameId, new Set())
    }
    this.gameRooms.get(gameId)!.add(socket.id)

    // Notify others in the room
    socket.to(roomName).emit('user-joined', {
      userId: user.id,
      username: user.username
    })

    structuredLogger.info('User joined game room', {
      userId: user.id,
      gameId,
      roomSize: this.gameRooms.get(gameId)!.size
    })
  }

  private leaveGameRoom(socket: AuthenticatedSocket, gameId: string) {
    const user = socket.user!
    const roomName = `game:${gameId}`
    
    socket.leave(roomName)
    
    const room = this.gameRooms.get(gameId)
    if (room) {
      room.delete(socket.id)
      if (room.size === 0) {
        this.gameRooms.delete(gameId)
      }
    }

    // Notify others in the room
    socket.to(roomName).emit('user-left', {
      userId: user.id,
      username: user.username
    })
  }

  private async handleGameBooking(socket: AuthenticatedSocket, data: any) {
    const user = socket.user!
    
    try {
      // Validate booking data
      const { gameId, playerCount, message } = data
      
      // Here you would implement the booking logic
      // For now, we'll just broadcast the booking attempt
      
      this.io!.to(`game:${gameId}`).emit('booking-attempt', {
        userId: user.id,
        username: user.username,
        playerCount,
        message,
        timestamp: new Date().toISOString()
      })

      structuredLogger.userAction('real-time-booking-attempt', user.id, { gameId })
    } catch (error) {
      socket.emit('booking-error', {
        message: 'Failed to process booking'
      })
      structuredLogger.error('Real-time booking error', error as Error, {
        userId: user.id,
        data
      })
    }
  }

  private handleGameMessage(socket: AuthenticatedSocket, data: any) {
    const user = socket.user!
    const { gameId, message } = data

    // Broadcast message to all users in the game room
    this.io!.to(`game:${gameId}`).emit('new-message', {
      id: `msg_${Date.now()}`,
      userId: user.id,
      username: user.username,
      message,
      timestamp: new Date().toISOString()
    })
  }

  private handleDisconnection(socket: AuthenticatedSocket) {
    const user = socket.user!
    
    // Remove from user sockets mapping
    this.userSockets.delete(user.id)

    // Remove from all game rooms
    this.gameRooms.forEach((sockets, gameId) => {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id)
        
        // Notify room about user leaving
        socket.to(`game:${gameId}`).emit('user-left', {
          userId: user.id,
          username: user.username
        })

        if (sockets.size === 0) {
          this.gameRooms.delete(gameId)
        }
      }
    })

    structuredLogger.info('User disconnected from WebSocket', {
      userId: user.id,
      username: user.username
    })
  }

  // Public methods for triggering events from API routes
  public notifyGameUpdate(gameId: string, update: any) {
    this.io?.to(`game:${gameId}`).emit('game-updated', update)
  }

  public notifyUserBookingConfirmed(userId: string, booking: any) {
    this.io?.to(`user:${userId}`).emit('booking-confirmed', booking)
  }

  public notifyNewGameCreated(game: any) {
    this.io?.emit('new-game-created', game)
  }
}

export const wsManager = new WebSocketManager()