import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserBalance } from '../monetization/entities/user-balance.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserBalance)
    private balanceRepository: Repository<UserBalance>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);
    
    // Create balance for new user
    const balance = this.balanceRepository.create({
      userId: savedUser.id,
      balance: 0,
    });
    await this.balanceRepository.save(balance);
    
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['balance'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updateStats(
    id: string,
    wpm: number,
    accuracy: number,
    isWinner: boolean,
  ): Promise<void> {
    const user = await this.findOne(id);
    user.totalGames += 1;
    if (isWinner) {
      user.totalWins += 1;
    }
    
    // Update average WPM
    const totalWPM = user.averageWPM * (user.totalGames - 1) + wpm;
    user.averageWPM = totalWPM / user.totalGames;
    
    // Update best WPM
    if (wpm > user.bestWPM) {
      user.bestWPM = wpm;
    }
    
    // Update average accuracy
    const totalAccuracy = user.averageAccuracy * (user.totalGames - 1) + accuracy;
    user.averageAccuracy = totalAccuracy / user.totalGames;
    
    await this.usersRepository.save(user);
  }
}
