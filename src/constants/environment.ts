import dotenv from 'dotenv';

dotenv.config();

export const __PORT__ = process.env.PORT || 8000;

export const __ORIGIN__ = process.env.ORIGIN || 'http://localhost:8081';

export const __BASE_PATH__ = process.env.BASE_PATH || '/api'; 

export const __DATABASE_URL__ = process.env.DATABASE_URL || "postgres://postgres:mysecretpassword@localhost:5432/postgres";

export const __DATABASE_SCHEMA__ = process.env.DATABASE_SCHEMA || "promoter_manager";

export const __JWT_SECRET__ = process.env.JWT_SECRET || '';

/** Client Email */
export const __CLIENT_ID__ = process.env.CLIENT_ID || '';

export const __REFRESH_TOKEN_ = process.env.REFRESH_TOKEN || '';

export const __CLIENT_SECRET__ = process.env.CLIENT_SECRET || '';

export const __EMAIL_USER__ = process.env.EMAIL_USER || '';

