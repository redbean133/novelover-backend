import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Follow } from './follow.entity';
import { User } from '../user/user.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async follow(userId: string, targetId: string) {
    if (userId === targetId) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Không thể tự theo dõi bản thân',
      });
    }

    const follower = await this.userRepo.findOneBy({ id: userId });
    const following = await this.userRepo.findOneBy({ id: targetId });

    if (!follower || !following)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Người dùng không tồn tại',
      });

    const existing = await this.followRepo.findOne({
      where: { follower: { id: userId }, following: { id: targetId } },
    });

    if (existing) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Đã theo dõi người dùng này',
      });
    }

    const follow = this.followRepo.create({ follower, following });
    await this.followRepo.save(follow);
    return { success: true };
  }

  async unfollow(userId: string, targetId: string) {
    const existing = await this.followRepo.findOne({
      where: { follower: { id: userId }, following: { id: targetId } },
    });

    if (!existing) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bạn chưa theo dõi người dùng này',
      });
    }

    await this.followRepo.remove(existing);
    return { success: true };
  }

  async getFollowers(
    userId: string,
    currentUserId: string | null,
    query: { page?: number; limit?: number; search?: string },
  ) {
    const { page = 1, limit = 50, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.followRepo
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.follower', 'follower')
      .where('follow.following_id = :userId', { userId });

    if (search) {
      queryBuilder.andWhere(
        '(follower.username ILIKE :search OR follower.display_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [follows, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const followers = follows.map((follow) => ({
      id: follow.follower.id,
      username: follow.follower.username,
      displayName: follow.follower.displayName,
      avatarUrl: follow.follower.avatarUrl,
    }));
    const followerIds = followers.map((user) => user.id);

    if (currentUserId === null) return followers;

    // Get current user's following
    const followingOfCurrentUser = await this.followRepo.find({
      where: {
        follower: { id: currentUserId },
        following: { id: In(followerIds) },
      },
      relations: ['following'],
      select: {
        following: { id: true },
      },
    });

    const followingIdsOfCurrentUser = new Set(
      followingOfCurrentUser.map((follow) => follow.following.id),
    );

    const data = followers.map((follower) => ({
      ...follower,
      isFollowing: followingIdsOfCurrentUser.has(follower.id),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFollowing(
    userId: string,
    currentUserId: string | null,
    query: { page?: number; limit?: number; search?: string },
  ) {
    const { page = 1, limit = 50, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.followRepo
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.following', 'following')
      .where('follow.follower_id = :userId', { userId });

    if (search) {
      queryBuilder.andWhere(
        '(following.username ILIKE :search OR following.display_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [follows, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const following = follows.map((follow) => ({
      id: follow.following.id,
      username: follow.following.username,
      displayName: follow.following.displayName,
      avatarUrl: follow.following.avatarUrl,
    }));
    const followingIds = following.map((user) => user.id);
    if (currentUserId === null) return following;

    // Get current user's following
    const followingOfCurrentUser = await this.followRepo.find({
      where: {
        follower: { id: currentUserId },
        following: { id: In(followingIds) },
      },
      relations: ['following'],
      select: {
        following: { id: true },
      },
    });

    const followingIdsOfCurrentUser = new Set(
      followingOfCurrentUser.map((follow) => follow.following.id),
    );

    const data = following.map((follow) => ({
      ...follow,
      isFollowing: followingIdsOfCurrentUser.has(follow.id),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async isFollowing(userId: string, targetId: string) {
    const follow = await this.followRepo.findOne({
      where: {
        follower: { id: userId },
        following: { id: targetId },
      },
      select: ['id'],
    });

    return follow ? { isFollowing: true } : { isFollowing: false };
  }
}
