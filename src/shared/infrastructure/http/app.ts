/* eslint-disable no-console */
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
// import jwt from 'jsonwebtoken';
import routes from './routes';
import DomainError from '@/shared/errors/domain-error';
import { NotFoundError } from '@/shared/application/errors/not-found-error';
import ApplicationError from '@/shared/errors/application-error';
import { ZodError } from 'zod';
// import { auth } from 'express-openid-connect';
// import { prismaService } from '../database/prisma/prisma.service';
// import { env } from '../env-config/env';
// import ensureSingleSession from './middlewares/ensureSingleSession';
// import cors from 'cors';

const app = express();

// app.use(
//   cors({
//     origin: ['*'],
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   }),
// );

app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ message: 'Hello World' });
});

app.use(routes);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot find ${req.originalUrl} on this server`));
});

app.use(
  (error: Error, request: Request, response: Response, next: NextFunction) => {
    if (error instanceof ApplicationError || error instanceof DomainError) {
      return response.status(error.statusCode).json({
        status: 'error',
        message: error.message,
        name: error.name,
      });
    }
    if (error instanceof ZodError) {
      return response.status(400).json({
        message: 'Invalid input',
        errors: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return response.status(500).json({
      status: 'error',
      message: 'Internal server error',
      err: error,
    });
  },
);

export { app };
