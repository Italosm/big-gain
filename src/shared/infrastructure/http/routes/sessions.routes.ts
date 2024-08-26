import { Router } from 'express';
import { auth0IdSchema, createSessionSchema } from '../schemas/schemas';
import { prismaService } from '../../database/prisma/prisma.service';
import { NotFoundError } from '@/shared/application/errors/not-found-error';
import jwt from 'jsonwebtoken';
const sessionsRoutes = Router();

sessionsRoutes.get('/:auth0_id', async (req, res) => {
  const { auth0_id } = req.params;
  auth0IdSchema.parse(auth0_id);
  const user = await prismaService.user.findUnique({
    where: { auth0_id },
    include: {
      PinnacleSubscription: true,
    },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return res.json(user);
});

sessionsRoutes.post('/:auth0_id', async (req, res) => {
  const { auth0_id } = req.params;
  auth0IdSchema.parse(auth0_id);
  const ip = req.ip;
  const { idToken } = req.body;
  createSessionSchema.parse(idToken);
  const decodedToken = jwt.decode(idToken) as jwt.JwtPayload;
  const expiresAt = decodedToken?.exp
    ? new Date(decodedToken.exp * 1000)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prismaService.user.findUnique({
    where: { auth0_id },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  const sessionExists = await prismaService.session.findUnique({
    where: { user_id: user.id },
  });
  if (sessionExists) {
    await prismaService.recordSession.create({
      data: {
        user_id: user.id,
        session_ip: ip,
        session_id: sessionExists.session_id,
        action: 'LOGIN',
        expired_in: sessionExists.expires_at,
      },
    });
  }
  await prismaService.session.create({
    data: {
      user_id: user.id,
      session_ip: ip,
      session_id: idToken,
      action: 'LOGIN',
      expires_at: expiresAt,
    },
  });
  res.status(201).json({
    message: 'Session created successfully',
  });
});

export default sessionsRoutes;
