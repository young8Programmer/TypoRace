import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBalance } from './entities/user-balance.entity';
import { Skin } from './entities/skin.entity';
import { UserSkin } from './entities/user-skin.entity';
import { Tournament, TournamentStatus } from './entities/tournament.entity';
import { TournamentParticipant } from './entities/tournament-participant.entity';

@Injectable()
export class MonetizationService {
  constructor(
    @InjectRepository(UserBalance)
    private balanceRepository: Repository<UserBalance>,
    @InjectRepository(Skin)
    private skinRepository: Repository<Skin>,
    @InjectRepository(UserSkin)
    private userSkinRepository: Repository<UserSkin>,
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,
    @InjectRepository(TournamentParticipant)
    private participantRepository: Repository<TournamentParticipant>,
  ) {}

  // Balance operations
  async getUserBalance(userId: string): Promise<UserBalance> {
    let balance = await this.balanceRepository.findOne({ where: { userId } });
    if (!balance) {
      balance = this.balanceRepository.create({
        userId,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
      });
      balance = await this.balanceRepository.save(balance);
    }
    return balance;
  }

  async addBalance(userId: string, amount: number): Promise<UserBalance> {
    const balance = await this.getUserBalance(userId);
    balance.balance = Number(balance.balance) + amount;
    balance.totalEarned = Number(balance.totalEarned) + amount;
    return this.balanceRepository.save(balance);
  }

  async deductBalance(userId: string, amount: number): Promise<UserBalance> {
    const balance = await this.getUserBalance(userId);
    if (Number(balance.balance) < amount) {
      throw new BadRequestException('Insufficient balance');
    }
    balance.balance = Number(balance.balance) - amount;
    balance.totalSpent = Number(balance.totalSpent) + amount;
    return this.balanceRepository.save(balance);
  }

  // Skins
  async getAllSkins() {
    return this.skinRepository.find({ where: { isActive: true } });
  }

  async getUserSkins(userId: string) {
    return this.userSkinRepository.find({
      where: { userId },
      relations: ['skin'],
    });
  }

  async purchaseSkin(userId: string, skinId: string): Promise<UserSkin> {
    const skin = await this.skinRepository.findOne({ where: { id: skinId } });
    if (!skin) {
      throw new NotFoundException('Skin not found');
    }

    const existingSkin = await this.userSkinRepository.findOne({
      where: { userId, skinId },
    });
    if (existingSkin) {
      throw new BadRequestException('Skin already purchased');
    }

    await this.deductBalance(userId, Number(skin.price));

    const userSkin = this.userSkinRepository.create({
      userId,
      skinId,
      isEquipped: false,
    });

    return this.userSkinRepository.save(userSkin);
  }

  async equipSkin(userId: string, skinId: string): Promise<void> {
    // Unequip all skins of the same type
    const userSkin = await this.userSkinRepository.findOne({
      where: { userId, skinId },
      relations: ['skin'],
    });

    if (!userSkin) {
      throw new NotFoundException('Skin not owned');
    }

    const allUserSkins = await this.userSkinRepository.find({
      where: { userId },
      relations: ['skin'],
    });

    for (const us of allUserSkins) {
      if (us.skin.type === userSkin.skin.type) {
        us.isEquipped = false;
      }
    }

    userSkin.isEquipped = true;
    await this.userSkinRepository.save([...allUserSkins, userSkin]);
  }

  // Tournaments
  async createTournament(tournamentData: Partial<Tournament>): Promise<Tournament> {
    const tournament = this.tournamentRepository.create(tournamentData);
    return this.tournamentRepository.save(tournament);
  }

  async getActiveTournaments(): Promise<Tournament[]> {
    return this.tournamentRepository.find({
      where: [
        { status: TournamentStatus.REGISTRATION },
        { status: TournamentStatus.IN_PROGRESS },
      ],
      order: { startDate: 'ASC' },
    });
  }

  async joinTournament(userId: string, tournamentId: string): Promise<TournamentParticipant> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new BadRequestException('Tournament registration is closed');
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
      throw new BadRequestException('Tournament is full');
    }

    const existingParticipant = await this.participantRepository.findOne({
      where: { userId, tournamentId },
    });

    if (existingParticipant) {
      throw new BadRequestException('Already registered');
    }

    await this.deductBalance(userId, Number(tournament.entryFee));
    tournament.prizePool = Number(tournament.prizePool) + Number(tournament.entryFee) * 0.8;
    tournament.currentParticipants += 1;
    await this.tournamentRepository.save(tournament);

    const participant = this.participantRepository.create({
      userId,
      tournamentId,
    });

    return this.participantRepository.save(participant);
  }

  async finishTournament(tournamentId: string, winnerId: string): Promise<void> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
      relations: ['participants'],
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    tournament.status = TournamentStatus.FINISHED;
    tournament.winnerId = winnerId;
    tournament.endDate = new Date();

    const winnerPrize = Number(tournament.prizePool) * 0.8;
    await this.addBalance(winnerId, winnerPrize);

    await this.tournamentRepository.save(tournament);
  }
}
