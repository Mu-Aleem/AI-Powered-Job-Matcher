import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobPostingsService } from './job-postings.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('job-postings')
@UseGuards(JwtAuthGuard)
export class JobPostingsController {
  constructor(private jobPostingsService: JobPostingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateJobPostingDto,
  ) {
    return this.jobPostingsService.create(user.id, dto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.jobPostingsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  findMine(@CurrentUser() user: { id: string }) {
    return this.jobPostingsService.findByEmployer(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobPostingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateJobPostingDto,
  ) {
    return this.jobPostingsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.jobPostingsService.remove(id, user.id);
  }
}
