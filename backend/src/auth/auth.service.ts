import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, full_name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password with bcrypt (12 rounds)
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password_hash,
        full_name,
        monthly_budget: '0',
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    // Create refresh token in database
    const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10);
    await this.prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: hashedRefreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    // Create refresh token in database
    const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10);
    await this.prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: hashedRefreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      });

      // Verify token exists in database and is not revoked
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token_hash: refresh_token },
      });

      if (!storedToken || storedToken.revoked_at) {
        throw new UnauthorizedException('Refresh token is invalid or revoked');
      }

      // Check if token is expired
      if (storedToken.expires_at < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Generate new access token
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        {
          secret: process.env.JWT_SECRET || 'default-secret',
          expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        },
      );

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    // Revoke the refresh token
    await this.prisma.refreshToken.updateMany({
      where: {
        user_id: userId,
        token_hash: refreshToken,
      },
      data: {
        revoked_at: new Date(),
      },
    });

    return { message: 'Successfully logged out' };
  }

  private async generateTokens(userId: string) {
    const access_token = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_SECRET || 'default-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      },
    );

    const refresh_token = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      },
    );

    return { access_token, refresh_token };
  }
}
