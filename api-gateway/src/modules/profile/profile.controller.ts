import { Controller, Get, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('/profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id')
  getProfileInfo(@Param('id') profileId: string) {
    return this.profileService.getProfileInfo(profileId);
  }
}
