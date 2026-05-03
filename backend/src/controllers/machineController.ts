import { Request, Response } from 'express';
import * as machineService from '../services/machineService';

const getId = (req: Request): string => req.params['id'] as string;

export const getAll = async (req: Request, res: Response) => {
  try {
    const machines = await machineService.getAllMachines();
    res.json(machines);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const start = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    const { userId, durationMinutes, userNote } = req.body;
    if (!userId || !durationMinutes)
      return res.status(400).json({ error: 'userId and durationMinutes are required' });

    const machine = await machineService.startMachine(id, userId, Number(durationMinutes), userNote);
    res.json(machine);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const finish = async (req: Request, res: Response) => {
  try {
    const machine = await machineService.finishMachine(getId(req));
    res.json(machine);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const clear = async (req: Request, res: Response) => {
  try {
    const machine = await machineService.clearMachine(getId(req));
    res.json(machine);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const extend = async (req: Request, res: Response) => {
  try {
    const { extraMinutes } = req.body;
    if (!extraMinutes)
      return res.status(400).json({ error: 'extraMinutes is required' });

    const machine = await machineService.extendMachine(getId(req), Number(extraMinutes));
    res.json(machine);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const report = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const result = await machineService.reportMachine(getId(req), userId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const ownerWhatsApp = async (req: Request, res: Response) => {
  try {
    const result = await machineService.getOwnerWhatsApp(getId(req));
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
