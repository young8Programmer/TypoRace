import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';

@Injectable()
export class RoomsService {
  private waitingRooms: Map<string, Room> = new Map();
  private activeRooms: Map<string, Room> = new Map();

  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async createRoom(name: string, text: string, maxPlayers: number = 3): Promise<Room> {
    const room = this.roomsRepository.create({
      name,
      text,
      maxPlayers,
      status: RoomStatus.WAITING,
      players: [],
    });
    return this.roomsRepository.save(room);
  }

  async findAvailableRoom(): Promise<Room | null> {
    return this.roomsRepository.findOne({
      where: {
        status: RoomStatus.WAITING,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findRoomById(id: string): Promise<Room> {
    return this.roomsRepository.findOne({ where: { id } });
  }

  async addPlayerToRoom(roomId: string, userId: string, username: string): Promise<Room> {
    const room = await this.findRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const playerExists = room.players.some(p => p.userId === userId);
    if (!playerExists) {
      room.players.push({
        userId,
        username,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        position: room.players.length + 1,
        finished: false,
      });
    }

    if (room.players.length >= room.maxPlayers) {
      room.status = RoomStatus.COUNTDOWN;
    }

    return this.roomsRepository.save(room);
  }

  async updatePlayerProgress(
    roomId: string,
    userId: string,
    progress: number,
    wpm: number,
    accuracy: number,
  ): Promise<Room> {
    const room = await this.findRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const player = room.players.find(p => p.userId === userId);
    if (player) {
      player.progress = progress;
      player.wpm = wpm;
      player.accuracy = accuracy;
    }

    return this.roomsRepository.save(room);
  }

  async markPlayerFinished(roomId: string, userId: string): Promise<Room> {
    const room = await this.findRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const player = room.players.find(p => p.userId === userId);
    if (player) {
      player.finished = true;
      player.finishedAt = new Date();
    }

    // Check if all players finished
    const allFinished = room.players.every(p => p.finished);
    if (allFinished) {
      room.status = RoomStatus.FINISHED;
      room.finishedAt = new Date();
      
      // Determine winner
      const winner = room.players.reduce((prev, current) => 
        (current.wpm > prev.wpm) ? current : prev
      );
      room.winnerId = winner.userId;
    }

    return this.roomsRepository.save(room);
  }

  async startRoom(roomId: string): Promise<Room> {
    const room = await this.findRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.status = RoomStatus.IN_PROGRESS;
    room.startedAt = new Date();
    return this.roomsRepository.save(room);
  }

  async getRoomText(roomId: string): Promise<string> {
    const room = await this.findRoomById(roomId);
    return room?.text || '';
  }

  generateRandomText(): string {
    const texts = [
      "The quick brown fox jumps over the lazy dog. Programming is an art that requires patience and dedication.",
      "Technology has transformed the way we live and work. Every day brings new opportunities to learn and grow.",
      "Success comes to those who are willing to put in the effort. Hard work beats talent when talent doesn't work hard.",
      "The future belongs to those who believe in the beauty of their dreams. Never give up on what you want most.",
      "Innovation distinguishes between a leader and a follower. Think different and make a difference in the world.",
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  }
}
