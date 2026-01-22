import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { GameResult } from './entities/game-result.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(GameResult)
    private gameResultsRepository: Repository<GameResult>,
  ) {}

  async create(roomId: string, text: string, participants: string[]): Promise<Game> {
    const game = this.gamesRepository.create({
      roomId,
      text,
      participants,
    });
    return this.gamesRepository.save(game);
  }

  async createResult(resultData: Partial<GameResult>): Promise<GameResult> {
    const result = this.gameResultsRepository.create(resultData);
    return this.gameResultsRepository.save(result);
  }

  async getUserResults(userId: string, limit: number = 10): Promise<GameResult[]> {
    return this.gameResultsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['game'],
    });
  }

  async getRecentGames(limit: number = 20): Promise<Game[]> {
    return this.gamesRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['results', 'results.user'],
    });
  }
}
