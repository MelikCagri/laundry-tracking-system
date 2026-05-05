import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
  user?: any;
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Erişim reddedildi: Token bulunamadı veya format hatalı' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: 'Sunucu yapılandırma hatası' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    if (decoded.role !== 'ADMIN') {
      res.status(403).json({ error: 'Erişim reddedildi: Admin yetkisi gereklidir' });
      return;
    }

    req.user = decoded; // İstek nesnesine kullanıcı bilgisini ekle
    next(); // Sonraki adıma/fonksiyona geç
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
};
