import { Router } from 'express';
import {
  auth0IdSchema,
  createUserAddressSchema,
  createUserPinnacleSchema,
  createUserSchema,
  listUsersSchema,
  updateUserAddressSchema,
  updateUserPinnacleSchema,
  updateUserSchema,
} from '../schemas/schemas';
import { prismaService } from '../../database/prisma/prisma.service';
import { ConflictError } from '@/shared/domain/errors/conflict-error';
import { createStripeCustomer } from '@/shared/utils/stripe';
import { NotFoundError } from '@/shared/application/errors/not-found-error';
import ensureSingleSession from '../middlewares/ensureSingleSession';

const usersRoutes = Router();

usersRoutes.get('/test-session', ensureSingleSession, async (req, res) => {
  res.status(200).json({ message: 'Session is valid and unique' });
});

usersRoutes.get('/:auth0_id', async (req, res) => {
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

usersRoutes.get('/', async (req, res) => {
  const { limit, page, sortBy, order, pinnacle_status, has_pinnacle } =
    listUsersSchema.parse(req.query);

  const offset = (page - 1) * limit;

  const whereClause: any = {};

  if (pinnacle_status !== undefined) {
    whereClause.PinnacleSubscription = {
      pinnacle_status,
    };
  }

  if (has_pinnacle) {
    whereClause.PinnacleSubscription = {
      isNot: null,
    };
  }

  const totalUsers = await prismaService.user.count({
    where: whereClause,
  });

  const users = await prismaService.user.findMany({
    skip: offset,
    take: limit,
    orderBy: {
      [sortBy]: order,
    },
    include: {
      PinnacleSubscription: true,
    },
    where: whereClause,
  });

  const totalPages = Math.ceil(totalUsers / limit);

  return res.json({
    data: users,
    pagination: {
      page,
      limit,
      totalPages,
      totalUsers,
    },
  });
});

usersRoutes.post('/', async (req, res) => {
  const validation = createUserSchema.parse(req.body);
  const data = { ...validation };
  const userExists = await prismaService.user.findUnique({
    where: { auth0_id: data.auth0_id },
  });
  if (userExists) {
    throw new ConflictError('User already exists');
  }

  const documentExists = await prismaService.user.findUnique({
    where: { document: data.document },
  });

  if (documentExists) {
    throw new ConflictError('Document already exists');
  }

  if (data.email) {
    const emailExists = await prismaService.user.findUnique({
      where: { document: data.email },
    });

    if (emailExists) {
      throw new ConflictError('Email already exists');
    }
  }
  const user = await prismaService.user.create({
    data: {
      auth0_id: data.auth0_id,
      name: data.name,
      email: data.email,
      document: data.document,
      phones: data.phones,
      avatar: data.avatar,
      birth_date: data.birth_date,
    },
  });
  const customer = await createStripeCustomer({
    email: data.email,
    name: data.document,
  });
  await prismaService.stripeSubscription.create({
    data: {
      user_id: user.id,
      customer_id: customer.id,
    },
  });
  return res.json(user);
});

usersRoutes.post('/pinnacle/:auth0_id', async (req, res) => {
  const { auth0_id } = req.params;
  auth0IdSchema.parse(auth0_id);
  const validation = createUserPinnacleSchema.parse(req.body);
  const data = { ...validation };
  const userExists = await prismaService.user.findUnique({
    where: { auth0_id },
  });
  if (!userExists) {
    throw new NotFoundError('User not Found');
  }
  const pinnacleSubscriptionExists =
    await prismaService.pinnacleSubscription.findUnique({
      where: { pinnacle_id: data.pinnacle_id },
    });
  if (pinnacleSubscriptionExists) {
    throw new ConflictError('Pinnacle id already exists');
  }
  const pinnacleSubscription = await prismaService.pinnacleSubscription.create({
    data: {
      user_id: userExists.id,
      pinnacle_id: data.pinnacle_id,
      pinnacle_status: data.pinnacle_status,
      pinnacle_date: data.pinnacle_date,
      pinnacle_exp: data.pinnacle_exp,
      comments: data.comments,
    },
  });
  return res.json(pinnacleSubscription);
});
usersRoutes.put('/pinnacle/:auth0_id', async (req, res) => {
  const { auth0_id } = req.params;
  auth0IdSchema.parse(auth0_id);

  const validation = updateUserPinnacleSchema.parse(req.body);
  const data = { ...validation };
  const userExists = await prismaService.user.findUnique({
    where: { auth0_id },
  });
  if (!userExists) {
    throw new NotFoundError('User not Found');
  }
  const user_id = userExists.id;
  const pinnacleSubscriptionExists =
    prismaService.pinnacleSubscription.findUnique({
      where: { user_id },
    });

  if (!pinnacleSubscriptionExists) {
    throw new NotFoundError('Pinnacle subscription not Found');
  }
  const pinnacleSubscription = await prismaService.pinnacleSubscription.update({
    where: { user_id },
    data: {
      ...data,
    },
  });
  return res.json(pinnacleSubscription);
});

usersRoutes.put('/:auth0_id', async (req, res) => {
  const { auth0_id } = req.params;
  auth0IdSchema.parse(auth0_id);
  const validation = updateUserSchema.parse(req.body);
  const data = { ...validation };
  const user = await prismaService.user.findUnique({
    where: { auth0_id },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updatedUser = await prismaService.user.update({
    where: { auth0_id },
    data: {
      ...data,
    },
  });

  return res.json(updatedUser);
});

usersRoutes.get('/address/:auth0_id', async (req, res) => {
  const { auth0_id } = req.params;
  auth0IdSchema.parse(auth0_id);
  const user = await prismaService.user.findUnique({
    where: { auth0_id },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  const address = await prismaService.userAddress.findFirst({
    where: {
      user_id: user.id,
    },
  });
  if (!address) {
    throw new NotFoundError('Address not found');
  }
  return res.json(address);
});

usersRoutes.post('/address/:auth0_id', async (req, res) => {
  const { auth0_id } = req.params;
  auth0IdSchema.parse(auth0_id);
  const validation = createUserAddressSchema.parse(req.body);
  const data = { ...validation };
  const userExists = await prismaService.user.findUnique({
    where: { auth0_id },
  });
  if (!userExists) {
    throw new NotFoundError('User not Found');
  }
  const address = await prismaService.userAddress.create({
    data: {
      user_id: userExists.id,
      address: data.address,
      cep: data.cep,
      complement: data.complement,
      neighborhood: data.neighborhood,
      number: data.number,
      city: data.city,
      state: data.state,
    },
  });
  return res.json(address);
});

usersRoutes.put('/address/:auth0_id', async (req, res) => {
  const { auth0_id } = req.params;
  auth0IdSchema.parse(auth0_id);

  const validation = updateUserAddressSchema.parse(req.body);
  const data = { ...validation };

  const userExists = await prismaService.user.findUnique({
    where: { auth0_id },
  });

  if (!userExists) {
    throw new NotFoundError('User not found');
  }

  const addressExists = await prismaService.userAddress.findFirst({
    where: { user_id: userExists.id },
  });

  if (!addressExists) {
    throw new NotFoundError('Address not found');
  }

  const updatedAddress = await prismaService.userAddress.update({
    where: { id: addressExists.id },
    data: {
      ...data,
    },
  });

  return res.json(updatedAddress);
});

usersRoutes.get('/pinnacle/:auth0_id', async (req, res) => {
  const { auth0_id } = req.params;
  auth0IdSchema.parse(auth0_id);
  const user = await prismaService.user.findUnique({
    where: { auth0_id },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  const pinnacleSubscriprion =
    await prismaService.pinnacleSubscription.findUnique({
      where: {
        user_id: user.id,
      },
    });
  if (!pinnacleSubscriprion) {
    throw new NotFoundError('pinnacleSubscriprion not found');
  }
  return res.json(pinnacleSubscriprion);
});

usersRoutes.delete(
  '/sessions/:auth0_id',
  ensureSingleSession,
  async (req, res) => {
    const { auth0_id } = req.params;
    auth0IdSchema.parse(auth0_id);
    const user = await prismaService.user.findUnique({
      where: { auth0_id },
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const sessionExists = await prismaService.session.findUnique({
      where: { user_id: user.id },
    });
    if (!sessionExists) {
      throw new NotFoundError('Session not found');
    }
    await prismaService.recordSession.create({
      data: {
        user_id: user.id,
        session_ip: sessionExists.session_ip,
        session_id: sessionExists.session_id,
        action: 'LOGOUT',
        expired_in: sessionExists.expires_at,
      },
    });
    await prismaService.session.delete({
      where: { user_id: user.id },
    });
    res.status(200).json({
      message: 'Session deleted successfully',
    });
  },
);

export default usersRoutes;
