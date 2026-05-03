import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const identify = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    const user = await userService.identifyUser(phone);
    res.json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
