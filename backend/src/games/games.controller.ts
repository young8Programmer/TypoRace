import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-results')
  async getMyResults(@Request() req) {
    return this.gamesService.getUserResults(req.user.id);
  }

  @Get('recent')
  async getRecentGames() {
    return this.gamesService.getRecentGames();
  }
}
