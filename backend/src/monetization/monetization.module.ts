import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonetizationService } from './monetization.service';
import { MonetizationController } from './monetization.controller';
import { UserBalance } from './entities/user-balance.entity';
import { Skin } from './entities/skin.entity';
import { UserSkin } from './entities/user-skin.entity';
import { Tournament } from './entities/tournament.entity';
import { TournamentParticipant } from './entities/tournament-participant.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserBalance,
      Skin,
      UserSkin,
      Tournament,
      TournamentParticipant,
    ]),
    UsersModule,
  ],
  controllers: [MonetizationController],
  providers: [MonetizationService],
  exports: [MonetizationService],
})
export class MonetizationModule {}
