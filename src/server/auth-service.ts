import crypto from 'crypto';
import { getDb } from '../lib/sqlite-db';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  full_name: string | null;
  plan: 'free' | 'premium' | 'business';
  stripe_customer_id: string | null;
  ai_credits_balance: number;
  two_factor_enabled: number;
  created_at: string;
}

export class AuthService {
  private static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private static verifyPassword(password: string, combinedHash: string): boolean {
    const [salt, key] = combinedHash.split(':');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
  }

  static register(email: string, password: string, fullName: string): UserRow {
    const db = getDb();
    const id = crypto.randomUUID();
    const passwordHash = this.hashPassword(password);

    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, plan, ai_credits_balance)
      VALUES (?, ?, ?, ?, 'free', 0)
    `);

    stmt.run(id, email.toLowerCase().trim(), passwordHash, fullName.trim());
    return this.getUserById(id)!;
  }

  static login(email: string, password: string): UserRow | null {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as UserRow | undefined;
    
    if (!user || !user.password_hash) return null;
    if (!this.verifyPassword(password, user.password_hash)) return null;

    return user;
  }

  static getUserById(id: string): UserRow | null {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    return user || null;
  }
}
