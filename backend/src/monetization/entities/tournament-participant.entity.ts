import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tournament } from './tournament.entity';

@Entity('tournament_participants')
export class TournamentParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  tournamentId: string;

  @Column({ type: 'float', default: 0 })
  bestWPM: number;

  @Column({ type: 'float', default: 0 })
  averageWPM: number;

  @Column({ default: 0 })
  gamesPlayed: number;

  @Column({ default: 0 })
  position: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prize: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Tournament, (tournament) => tournament.participants)
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;
}
