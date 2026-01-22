import { Controller, Get, Post, UseGuards, Request, Body, Param } from '@nestjs/common';
import { MonetizationService } from './monetization.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('monetization')
export class MonetizationController {
  constructor(private monetizationService: MonetizationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Request() req) {
    return this.monetizationService.getUserBalance(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('skins')
  async getAllSkins() {
    return this.monetizationService.getAllSkins();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-skins')
  async getMySkins(@Request() req) {
    return this.monetizationService.getUserSkins(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase-skin/:skinId')
  async purchaseSkin(@Request() req, @Param('skinId') skinId: string) {
    return this.monetizationService.purchaseSkin(req.user.id, skinId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('equip-skin/:skinId')
  async equipSkin(@Request() req, @Param('skinId') skinId: string) {
    await this.monetizationService.equipSkin(req.user.id, skinId);
    return { message: 'Skin equipped successfully' };
  }

  @Get('tournaments')
  async getActiveTournaments() {
    return this.monetizationService.getActiveTournaments();
  }

  @UseGuards(JwtAuthGuard)
  @Post('tournaments/:tournamentId/join')
  async joinTournament(@Request() req, @Param('tournamentId') tournamentId: string) {
    return this.monetizationService.joinTournament(req.user.id, tournamentId);
  }
}
