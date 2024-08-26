/* eslint-disable no-console */
import { NextFunction, Request, Response } from 'express';
import { prismaService } from '../../database/prisma/prisma.service';
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error';
import jwt from 'jsonwebtoken';
import { NotFoundError } from '@/shared/application/errors/not-found-error';

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default async function ensureSingleSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new InvalidCredentialsError('JWT Token is missing.');
  }
  const [, token] = authHeader.split(' ');
  const decodedToken = jwt.decode(token) as jwt.JwtPayload;
  const { sub } = decodedToken as ITokenPayload;
  const user = await prismaService.user.findUnique({
    where: {
      auth0_id: sub,
    },
  });
  if (!user) {
    throw new NotFoundError('User not Found');
  }
  const session = await prismaService.session.findUnique({
    where: {
      user_id: user.id,
    },
  });
  if (!session) {
    throw new NotFoundError('Session not Found');
  }
  if (session.session_id != token) {
    throw new InvalidCredentialsError('Invalid Credentials');
  }
  return next();
}
