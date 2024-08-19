import { Router } from 'express';
import {
  auth0IdSchema,
  createUserAddressSchema,
  createUserPinnacleSchema,
  createUserSchema,
  updateUserAddressSchema,
  updateUserPinnacleSchema,
  updateUserSchema,
} from '../schemas/schemas';
import { prismaService } from '../../database/prisma/prisma.service';
import { ConflictError } from '@/shared/domain/errors/conflict-error';
import { createStripeCustomer } from '@/shared/utils/stripe';
import { NotFoundError } from '@/shared/application/errors/not-found-error';

const usersRoutes = Router();

usersRoutes.get('/:auth0_id', async (req, res) => {
  const { auth0_id } = req.params;
  auth0IdSchema.parse(auth0_id);
  const user = await prismaService.user.findUnique({
    where: { auth0_id: decodeURI(auth0_id) },
    include: {
      PinnacleSubscription: true,
    },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return res.json(user);
});

usersRoutes.post('/', async (req, res) => {
  const validation = createUserSchema.parse(req.body);
  const data = { ...validation };
  const userExists = await prismaService.user.findUnique({
    where: { auth0_id: decodeURI(data.auth0_id) },
  });
  if (userExists) {
    throw new ConflictError('User already exists');
  }
  const user = await prismaService.user.create({
    data: {
      auth0_id: decodeURI(data.auth0_id),
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
    where: { auth0_id: decodeURI(auth0_id) },
  });
  if (!userExists) {
    throw new NotFoundError('User not Found');
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
    where: { auth0_id: decodeURI(auth0_id) },
  });
  if (!userExists) {
    throw new NotFoundError('User not Found');
  }
  const pinnacleSubscription = await prismaService.pinnacleSubscription.update({
    where: { user_id: userExists.id },
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
    where: { auth0_id: decodeURI(auth0_id) },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updatedUser = await prismaService.user.update({
    where: { auth0_id: decodeURI(auth0_id) },
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
    where: { auth0_id: decodeURI(auth0_id) },
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
    where: { auth0_id: decodeURI(auth0_id) },
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
    where: { auth0_id: decodeURI(auth0_id) },
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
    where: { auth0_id: decodeURI(auth0_id) },
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

export default usersRoutes;
