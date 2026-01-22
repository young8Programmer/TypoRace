import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard, LeaderboardType } from './entities/leaderboard.entity';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,
  ) {}

  async getLeaderboard(type: LeaderboardType = LeaderboardType.ALL_TIME, limit: number = 100) {
    const query = this.leaderboardRepository
      .createQueryBuilder('leaderboard')
      .leftJoinAndSelect('leaderboard.user', 'user')
      .where('leaderboard.type = :type', { type })
      .orderBy('leaderboard.wpm', 'DESC')
      .addOrderBy('leaderboard.accuracy', 'DESC')
      .take(limit);

    const results = await query.getMany();
    
    // Add rank
    return results.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  async updateUserLeaderboard(
    userId: string,
    wpm: number,
    accuracy: number,
    type: LeaderboardType,
  ) {
    let entry = await this.leaderboardRepository.findOne({
      where: { userId, type },
    });

    if (!entry) {
      entry = this.leaderboardRepository.create({
        userId,
        type,
        wpm,
        accuracy,
        gamesPlayed: 1,
        wins: 0,
      });
    } else {
      entry.gamesPlayed += 1;
      entry.wpm = Math.max(entry.wpm, wpm);
      entry.accuracy = (entry.accuracy + accuracy) / 2;
    }

    return this.leaderboardRepository.save(entry);
  }

  async getUserRank(userId: string, type: LeaderboardType): Promise<number> {
    const entry = await this.leaderboardRepository.findOne({
      where: { userId, type },
    });

    if (!entry) {
      return 0;
    }

    const rank = await this.leaderboardRepository
      .createQueryBuilder('leaderboard')
      .where('leaderboard.type = :type', { type })
      .andWhere('leaderboard.wpm > :wpm', { wpm: entry.wpm })
      .getCount();

    return rank + 1;
  }
}
