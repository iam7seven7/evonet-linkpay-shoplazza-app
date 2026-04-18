import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/prisma/generated/client';
import config from '@/config';

const adapter = new PrismaPg({ connectionString: config.db });
const prisma = new PrismaClient({ adapter });
export { prisma };
