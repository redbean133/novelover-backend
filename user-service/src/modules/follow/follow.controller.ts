import { Controller } from '@nestjs/common';
import { FollowService } from './follow.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @MessagePattern({ cmd: 'user.follow' })
  follow(
    @Payload()
    { userId, targetId }: { userId: string; targetId: string },
  ) {
    return this.followService.follow(userId, targetId);
  }

  @MessagePattern({ cmd: 'user.unfollow' })
  unfollow(
    @Payload()
    { userId, targetId }: { userId: string; targetId: string },
  ) {
    return this.followService.unfollow(userId, targetId);
  }

  @MessagePattern({ cmd: 'user.get-followers' })
  getFollowers(
    @Payload()
    { userId, currentUserId }: { userId: string; currentUserId: string | null },
  ) {
    return this.followService.getFollowers(userId, currentUserId);
  }

  @MessagePattern({ cmd: 'user.get-following' })
  getFollowing(
    @Payload()
    { userId, currentUserId }: { userId: string; currentUserId: string | null },
  ) {
    return this.followService.getFollowing(userId, currentUserId);
  }

  @MessagePattern({ cmd: 'user.is-following' })
  isFollowing(
    @Payload() { userId, targetId }: { userId: string; targetId: string },
  ) {
    return this.followService.isFollowing(userId, targetId);
  }
}
