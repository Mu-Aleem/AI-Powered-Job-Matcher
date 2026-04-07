import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ access_token: string; user: UserResponseDto }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      password_hash: passwordHash,
      full_name: dto.full_name,
      role: dto.role,
    });

    const token = this.signToken(user.id, user.email, user.role);

    return {
      access_token: token,
      user: this.toResponseDto(user),
    };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; user: UserResponseDto }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.signToken(user.id, user.email, user.role);

    return {
      access_token: token,
      user: this.toResponseDto(user),
    };
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.toResponseDto(user);
  }

  private signToken(id: string, email: string, role: string): string {
    return this.jwtService.sign({ sub: id, email, role });
  }

  private toResponseDto(user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
  }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.full_name = user.full_name;
    dto.role = user.role as any;
    dto.created_at = user.created_at;
    return dto;
  }
}
