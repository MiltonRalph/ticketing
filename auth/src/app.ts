import express from 'express';
import cookieSession from 'cookie-session';

import { CurrentUserRouter } from './routes/current-user';
import { SigninRouter } from './routes/signin';
import { SignoutRouter } from './routes/signout';
import { SignupRouter } from './routes/signup';
import { errorHandler, NotFoundError } from '@ihetickets/common';

const app = express();
app.set('trust proxy', true);

app.use(express.json());
app.use(cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test"}));

app.use(CurrentUserRouter);
app.use(SigninRouter);
app.use(SignoutRouter);
app.use(SignupRouter);

app.all(/.*/, async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
