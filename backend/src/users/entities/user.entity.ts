import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { GameResult } from '../../games/entities/game-result.entity';
import { Leaderboard } from '../../leaderboard/entities/leaderboard.entity';
import { UserBalance } from '../../monetization/entities/user-balance.entity';
import { UserSkin } from '../../monetization/entities/user-skin.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 0 })
  totalGames: number;

  @Column({ default: 0 })
  totalWins: number;

  @Column({ type: 'float', default: 0 })
  averageWPM: number;

  @Column({ type: 'float', default: 0 })
  bestWPM: number;

  @Column({ type: 'float', default: 0 })
  averageAccuracy: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GameResult, (gameResult) => gameResult.user)
  gameResults: GameResult[];

  @OneToMany(() => Leaderboard, (leaderboard) => leaderboard.user)
  leaderboardEntries: Leaderboard[];

  @OneToOne(() => UserBalance, (balance) => balance.user)
  balance: UserBalance;

  @OneToMany(() => UserSkin, (userSkin) => userSkin.user)
  skins: UserSkin[];
}
