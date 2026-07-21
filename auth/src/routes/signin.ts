import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Password } from '../utils/password';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@ihetickets/common';
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('User does not exist!');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password,
    );
    if (!passwordsMatch) {
      throw new BadRequestError('User does not exist!');
    }

    // Generate JWT
    const userJwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!,
    );

    // Store it in a session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser)
  },
);

export { router as SigninRouter };
