import { Request, Response } from 'express';
import * as queueService from '../services/queueService';

const getId = (req: Request): string => req.params['id'] as string;

export const join = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const entry = await queueService.joinQueue(getId(req), userId);
    res.status(201).json(entry);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const leave = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const entry = await queueService.leaveQueue(getId(req), userId);
    res.json(entry);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const skip = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const entry = await queueService.skipQueue(getId(req), userId);
    res.json(entry);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const getInfo = async (req: Request, res: Response) => {
  try {
    const info = await queueService.getQueueInfo(getId(req));
    res.json(info);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getUserQueues = async (req: Request, res: Response) => {
  try {
    const userId = req.params['userId'] as string;
    const queues = await queueService.getUserQueues(userId);
    res.json(queues);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getPendingTurn = async (req: Request, res: Response) => {
  try {
    const userId = req.params['userId'] as string;
    const entry = await queueService.getUserPendingTurn(userId);
    res.json(entry); // null if no pending turn
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
