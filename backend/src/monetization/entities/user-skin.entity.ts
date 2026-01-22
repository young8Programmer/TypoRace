import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Skin } from './skin.entity';

@Entity('user_skins')
export class UserSkin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  skinId: string;

  @Column({ default: false })
  isEquipped: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.skins)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Skin, (skin) => skin.userSkins)
  @JoinColumn({ name: 'skinId' })
  skin: Skin;
}
