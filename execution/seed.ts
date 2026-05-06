/**
 * Seed Wrapper – execution/seed.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is the execution-layer entry point for seeding the database.
 *
 * The actual seed logic lives in `backend/prisma/seed.ts` so it can access
 * backend's node_modules (@prisma/client, dotenv, etc.).
 *
 * HOW TO RUN:
 *   From the project root:
 *     cd backend && npm run seed
 *
 *   Or directly:
 *     cd backend && npx ts-node prisma/seed.ts
 *
 * CONFIGURATION:
 *   Edit `backend/prisma/seed.ts` to change:
 *     - BLOCKS      → which blocks to seed (e.g. ['A', 'B'])
 *     - FLOORS      → which floors each block has (e.g. [1, 2])
 *     - WASHERS_PER_FLOOR / DRYERS_PER_FLOOR → machine counts
 *
 * WHY HERE?
 *   Per the 3-layer architecture (AGENTS.md), execution scripts live in
 *   execution/. Since seed logic depends on backend's compiled Prisma client,
 *   the actual script must reside in backend/prisma/. This wrapper documents
 *   that relationship and serves as the canonical execution entry point.
 */

import { execSync } from 'child_process';
import * as path from 'path';

const backendDir = path.resolve(__dirname, '../backend');

console.log('▶  Running seed from backend context...\n');
execSync('npm run seed', { cwd: backendDir, stdio: 'inherit' });
