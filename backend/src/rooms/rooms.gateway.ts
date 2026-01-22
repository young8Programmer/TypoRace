import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { GamesService } from '../games/games.service';
import { UsersService } from '../users/users.service';
import { RoomStatus } from './entities/room.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId
  private userRooms: Map<string, string> = new Map(); // userId -> roomId

  constructor(
    private roomsService: RoomsService,
    private gamesService: GamesService,
    private usersService: UsersService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      const roomId = this.userRooms.get(userId);
      if (roomId) {
        client.leave(roomId);
        this.server.to(roomId).emit('player_left', { userId });
      }
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);
      this.userRooms.delete(userId);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_matchmaking')
  async handleJoinMatchmaking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; username: string },
  ) {
    this.userSockets.set(data.userId, client.id);
    this.socketUsers.set(client.id, data.userId);

    // Find or create room
    let room = await this.roomsService.findAvailableRoom();
    
    if (!room || room.players.length >= room.maxPlayers) {
      const text = this.roomsService.generateRandomText();
      room = await this.roomsService.createRoom(`Room-${Date.now()}`, text, 3);
    }

    room = await this.roomsService.addPlayerToRoom(room.id, data.userId, data.username);
    this.userRooms.set(data.userId, room.id);
    
    client.join(room.id);
    this.server.to(room.id).emit('room_update', room);

    // Start countdown if room is full
    if (room.status === RoomStatus.COUNTDOWN) {
      this.startCountdown(room.id);
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
    this.server.to(data.roomId).emit('player_left', { socketId: client.id });
  }

  @SubscribeMessage('typing_progress')
  async handleTypingProgress(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      roomId: string;
      userId: string;
      typedText: string;
      currentCharIndex: number;
    },
  ) {
    const room = await this.roomsService.findRoomById(data.roomId);
    if (!room || room.status !== RoomStatus.IN_PROGRESS) {
      return;
    }

    const text = room.text;
    const progress = (data.currentCharIndex / text.length) * 100;
    
    // Calculate WPM and accuracy
    const { wpm, accuracy, correctChars, incorrectChars } = 
      this.calculateStats(text, data.typedText, room.startedAt);

    // Update player progress
    await this.roomsService.updatePlayerProgress(
      data.roomId,
      data.userId,
      progress,
      wpm,
      accuracy,
    );

    const updatedRoom = await this.roomsService.findRoomById(data.roomId);
    
    // Broadcast to all players in room
    this.server.to(data.roomId).emit('progress_update', {
      userId: data.userId,
      progress,
      wpm,
      accuracy,
      position: this.calculatePosition(updatedRoom.players),
    });

    // Check if player finished
    if (data.currentCharIndex >= text.length) {
      await this.handlePlayerFinished(data.roomId, data.userId, wpm, accuracy, correctChars, incorrectChars);
    }
  }

  private async handlePlayerFinished(
    roomId: string,
    userId: string,
    wpm: number,
    accuracy: number,
    correctChars: number,
    incorrectChars: number,
  ) {
    const room = await this.roomsService.markPlayerFinished(roomId, userId);
    
    // Save game result
    const timeTaken = (new Date().getTime() - new Date(room.startedAt).getTime()) / 1000;
    await this.gamesService.createResult({
      userId,
      gameId: room.id,
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars: correctChars + incorrectChars,
      timeTaken,
      position: this.calculatePosition(room.players),
      isWinner: room.winnerId === userId,
    });

    // Update user stats
    await this.usersService.updateStats(userId, wpm, accuracy, room.winnerId === userId);

    this.server.to(roomId).emit('player_finished', {
      userId,
      wpm,
      accuracy,
      position: this.calculatePosition(room.players),
    });

    if (room.status === RoomStatus.FINISHED) {
      this.server.to(roomId).emit('race_finished', {
        winner: room.winnerId,
        results: room.players.map(p => ({
          userId: p.userId,
          username: p.username,
          wpm: p.wpm,
          accuracy: p.accuracy,
          position: p.position,
        })),
      });
    }
  }

  private startCountdown(roomId: string) {
    let countdown = 3;
    const interval = setInterval(() => {
      this.server.to(roomId).emit('countdown', countdown);
      countdown--;

      if (countdown < 0) {
        clearInterval(interval);
        this.startRace(roomId);
      }
    }, 1000);
  }

  private async startRace(roomId: string) {
    const room = await this.roomsService.startRoom(roomId);
    this.server.to(roomId).emit('race_started', {
      text: room.text,
      startedAt: room.startedAt,
    });
  }

  private calculateStats(
    originalText: string,
    typedText: string,
    startTime: Date,
  ): { wpm: number; accuracy: number; correctChars: number; incorrectChars: number } {
    const timeElapsed = (new Date().getTime() - new Date(startTime).getTime()) / 1000 / 60; // minutes
    let correctChars = 0;
    let incorrectChars = 0;

    for (let i = 0; i < typedText.length && i < originalText.length; i++) {
      if (typedText[i] === originalText[i]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }

    const totalChars = correctChars + incorrectChars;
    const wordsTyped = typedText.trim().split(/\s+/).length;
    const wpm = timeElapsed > 0 ? wordsTyped / timeElapsed : 0;
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;

    return { wpm, accuracy, correctChars, incorrectChars };
  }

  private calculatePosition(players: any[]): number {
    const sorted = [...players].sort((a, b) => {
      if (a.finished && !b.finished) return -1;
      if (!a.finished && b.finished) return 1;
      if (a.finished && b.finished) {
        return (a.finishedAt?.getTime() || 0) - (b.finishedAt?.getTime() || 0);
      }
      return b.wpm - a.wpm;
    });
    return sorted.findIndex((p) => p) + 1;
  }
}
