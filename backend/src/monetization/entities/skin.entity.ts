import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSkin } from './user-skin.entity';

export enum SkinType {
  AVATAR = 'avatar',
  CAR = 'car',
  KEYBOARD = 'keyboard',
  THEME = 'theme',
}

@Entity('skins')
export class Skin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SkinType,
    default: SkinType.AVATAR,
  })
  type: SkinType;

  @Column()
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserSkin, (userSkin) => userSkin.skin)
  userSkins: UserSkin[];
}
