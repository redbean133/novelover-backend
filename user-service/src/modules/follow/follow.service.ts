import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
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

  async getFollowers(userId: string, currentUserId: string | null) {
    const follows = await this.followRepo.find({
      where: { following: { id: userId } },
      relations: ['follower'],
      select: {
        follower: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    });

    const followers = follows.map((follow) => follow.follower);
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

    return followers.map((follower) => ({
      ...follower,
      isFollowing: followingIdsOfCurrentUser.has(follower.id),
    }));
  }

  async getFollowing(userId: string, currentUserId: string | null) {
    const follows = await this.followRepo.find({
      where: { follower: { id: userId } },
      relations: ['following'],
      select: {
        following: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    });

    const following = follows.map((follow) => follow.following);
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

    return following.map((follow) => ({
      ...follow,
      isFollowing: followingIdsOfCurrentUser.has(follow.id),
    }));
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
