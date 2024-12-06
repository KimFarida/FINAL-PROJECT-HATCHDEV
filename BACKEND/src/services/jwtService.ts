import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}


class JwtService {
  private static readonly ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  private static readonly ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '1h';
  private static readonly REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  private static validateEnvironment() {
    if (!this.ACCESS_SECRET || !this.REFRESH_SECRET) {
      throw new Error('JWT secrets are missing from environment variables');
    }
  }

  static createTokens(userId: string, email: string, username: string): TokenResponse {
    this.validateEnvironment();

    const payload: TokenPayload = { userId, email, username };

    const accessToken = jwt.sign(payload, this.ACCESS_SECRET, {
      expiresIn: this.ACCESS_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: this.REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): TokenPayload {
    this.validateEnvironment();

    try {
      return jwt.verify(token, this.ACCESS_SECRET) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      }
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): TokenPayload {
    this.validateEnvironment();

    try {
      return jwt.verify(token, this.REFRESH_SECRET) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      throw new Error('Invalid refresh token');
    }
  }

  static refreshAccessToken(refreshToken: string): string {
    this.validateEnvironment();

    try {
      const payload = this.verifyRefreshToken(refreshToken);
      return jwt.sign(payload, this.ACCESS_SECRET, {
        expiresIn: this.ACCESS_EXPIRES_IN,
      });
    } catch (error) {
      throw new Error('Unable to refresh access token');
    }
  }
}


export default JwtService;
