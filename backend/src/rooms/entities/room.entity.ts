import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RoomStatus {
  WAITING = 'waiting',
  COUNTDOWN = 'countdown',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.WAITING,
  })
  status: RoomStatus;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'jsonb', default: [] })
  players: Array<{
    userId: string;
    username: string;
    progress: number;
    wpm: number;
    accuracy: number;
    position: number;
    finished: boolean;
    finishedAt?: Date;
  }>;

  @Column({ default: 2 })
  maxPlayers: number;

  @Column({ nullable: true })
  winnerId: string;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  finishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'winnerId' })
  winner: User;
}
