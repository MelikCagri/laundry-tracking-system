import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as machineService from '../services/machineService';
import { MachineStatus } from '@prisma/client';

dotenv.config();

export const login = (req: Request, res: Response): void => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur' });
      return;
    }

    const credentialsStr = process.env.ADMIN_CREDENTIALS;
    if (!credentialsStr) {
      res.status(500).json({ error: 'Sunucu hatası: Admin kimlik bilgileri yapılandırılmamış' });
      return;
    }

    let admins;
    try {
      admins = JSON.parse(credentialsStr);
    } catch (e) {
      res.status(500).json({ error: 'Sunucu hatası: Geçersiz kimlik bilgisi formatı' });
      return;
    }

    const admin = admins.find((a: any) => a.username === username && a.password === password);

    if (!admin) {
      res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
      return;
    }

    const token = jwt.sign(
      { username: admin.username, role: 'ADMIN' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Giriş başarılı' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// [ADMIN] Yeni makine oluştur
export const createMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { floor, type, block } = req.body;
    if (!floor || !type || !block) {
      res.status(400).json({ error: 'floor, type and block are required' });
      return;
    }
    if (!['WASHER', 'DRYER'].includes(type)) {
      res.status(400).json({ error: 'type must be WASHER or DRYER' });
      return;
    }
    if (!['A', 'C', 'D', 'E', 'F', 'Villa'].includes(block)) {
      res.status(400).json({ error: 'block must be A, C, D, E, F or Villa' });
      return;
    }
    const machine = await machineService.createMachine(Number(floor), type, block);
    res.status(201).json(machine);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

// [ADMIN] Makine sil
export const deleteMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    await machineService.deleteMachine(id);
    res.json({ success: true, message: `Machine ${id} deleted` });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

// [ADMIN] Makineyi zorla sıfırla
export const forceReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const machine = await machineService.forceResetMachine(id);
    res.json(machine);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

// [ADMIN] Makine durumunu manuel değiştir
export const setStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const { status } = req.body;
    if (!status || !Object.values(MachineStatus).includes(status)) {
      res.status(400).json({ error: `status must be one of: ${Object.values(MachineStatus).join(', ')}` });
      return;
    }
    const machine = await machineService.setMachineStatus(id, status as MachineStatus);
    res.json(machine);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

// [ADMIN] Tüm logları getir
export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await machineService.getAllLogs();
    res.json(logs);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
