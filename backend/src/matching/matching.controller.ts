import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { MatchFilterDto } from './dto/match-filter.dto';

@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Get('jobs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  findMatchingJobs(
    @CurrentUser() user: { id: string },
    @Query() filter: MatchFilterDto,
  ) {
    return this.matchingService.findJobsForResume(user.id, filter);
  }

  @Get('explain/:jobId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  explainMatch(
    @Param('jobId') jobId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.matchingService.explainMatch(user.id, jobId);
  }

  @Get('candidates/:jobId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  findMatchingCandidates(
    @Param('jobId') jobId: string,
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
  ) {
    return this.matchingService.findCandidatesForJob(
      jobId,
      user.id,
      limit ? parseInt(limit) : 20,
    );
  }
}
