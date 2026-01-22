import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LeaderboardType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time',
}

@Entity('leaderboard')
export class Leaderboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: LeaderboardType,
    default: LeaderboardType.ALL_TIME,
  })
  type: LeaderboardType;

  @Column({ type: 'float' })
  wpm: number;

  @Column({ type: 'float' })
  accuracy: number;

  @Column({ default: 0 })
  gamesPlayed: number;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  rank: number;

  @Index()
  @Column({ type: 'date', nullable: true })
  periodStart: Date;

  @Index()
  @Column({ type: 'date', nullable: true })
  periodEnd: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.leaderboardEntries)
  @JoinColumn({ name: 'userId' })
  user: User;
}
