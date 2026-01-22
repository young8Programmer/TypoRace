import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Game } from './game.entity';

@Entity('game_results')
export class GameResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  gameId: string;

  @Column({ type: 'float' })
  wpm: number;

  @Column({ type: 'float' })
  accuracy: number;

  @Column({ default: 0 })
  correctChars: number;

  @Column({ default: 0 })
  incorrectChars: number;

  @Column({ default: 0 })
  totalChars: number;

  @Column({ type: 'float' })
  timeTaken: number; // in seconds

  @Column({ default: 0 })
  position: number; // 1st, 2nd, 3rd, etc.

  @Column({ default: false })
  isWinner: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.gameResults)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Game, (game) => game.results)
  @JoinColumn({ name: 'gameId' })
  game: Game;
}
