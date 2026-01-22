import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import { Game } from '../games/entities/game.entity';
import { GameResult } from '../games/entities/game-result.entity';
import { Leaderboard } from '../leaderboard/entities/leaderboard.entity';
import { UserBalance } from '../monetization/entities/user-balance.entity';
import { Skin } from '../monetization/entities/skin.entity';
import { UserSkin } from '../monetization/entities/user-skin.entity';
import { Tournament } from '../monetization/entities/tournament.entity';
import { TournamentParticipant } from '../monetization/entities/tournament-participant.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'typorace'),
        entities: [
          User,
          Room,
          Game,
          GameResult,
          Leaderboard,
          UserBalance,
          Skin,
          UserSkin,
          Tournament,
          TournamentParticipant,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
