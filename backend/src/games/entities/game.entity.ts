import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { GameResult } from './game-result.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roomId: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ default: 0 })
  duration: number; // in seconds

  @Column({ type: 'jsonb', default: [] })
  participants: string[]; // user IDs

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => GameResult, (result) => result.game)
  results: GameResult[];
}
