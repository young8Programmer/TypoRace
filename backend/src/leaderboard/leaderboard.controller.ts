import { Controller, Get, Query, Param } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardType } from './entities/leaderboard.entity';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(
    @Query('type') type: string = 'all_time',
    @Query('limit') limit: string = '100',
  ) {
    const leaderboardType = LeaderboardType[type.toUpperCase()] || LeaderboardType.ALL_TIME;
    return this.leaderboardService.getLeaderboard(leaderboardType, parseInt(limit));
  }

  @Get('user/:userId/rank')
  async getUserRank(
    @Param('userId') userId: string,
    @Query('type') type: string = 'all_time',
  ) {
    const leaderboardType = LeaderboardType[type.toUpperCase()] || LeaderboardType.ALL_TIME;
    return this.leaderboardService.getUserRank(userId, leaderboardType);
  }
}
