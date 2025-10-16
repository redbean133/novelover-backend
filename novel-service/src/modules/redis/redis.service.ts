import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  increment(key: string) {
    return this.redis.incr(key).catch((error) => {
      console.error('Failed to increment key in Redis:', error);
    });
  }

  decrement(key: string) {
    return this.redis.decr(key).catch((error) => {
      console.error('Failed to decrement key in Redis:', error);
    });
  }

  get(key: string) {
    return this.redis.get(key).catch((error) => {
      console.error('Failed to get key from Redis:', error);
    });
  }

  set(key: string, value: string, expireSeconds?: number) {
    if (expireSeconds) {
      this.redis.set(key, value, 'EX', expireSeconds).catch((error) => {
        console.error('Failed to set key in Redis with expiration:', error);
      });
    } else {
      this.redis.set(key, value).catch((error) => {
        console.error('Failed to set key in Redis:', error);
      });
    }
  }

  delete(key: string) {
    return this.redis.del(key).catch((error) => {
      console.error('Failed to delete key from Redis:', error);
    });
  }

  getClient() {
    return this.redis;
  }
}
