import dotenv from 'dotenv';

dotenv.config();

export const __PORT__ = process.env.PORT || 8000;

export const __ORIGIN__ = process.env.ORIGIN || 'http://localhost:8081';

export const __BASE_PATH__ = process.env.BASE_PATH || '/api'; 

export const __DATABASE_URL__ = process.env.DATABASE_URL || "postgres://postgres:mysecretpassword@localhost:5432/postgres";

export const __DATABASE_SCHEMA__ = process.env.DATABASE_SCHEMA || "promoter_manager";

export const __JWT_SECRET__ = process.env.JWT_SECRET || 'cd844fbaf51642dd4f14c498d8808fb540018f67f3acccf8455e864b3e0a2abe9987dde3180cfc0eb0becc9b64bd744001830de8c3427eae6c99e51731b88e3c';

/** Client Email */
export const __CLIENT_ID__ = process.env.CLIENT_ID || '206458219222-uaatakq3lkktt6cchrarj77d86farfd9.apps.googleusercontent.com';

export const __ACCESS_TOKEN_ = process.env.ACCESS_TOKEN || 'AIzaSyDynvTvigEDjckjzTi6QC8gAcd_xl3mbgk';

export const __CLIENT_SECRET__ = process.env.CLIENT_SECRET || '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';

export const __EMAIL_USER__ = process.env.EMAIL_USER || 'f41873773@gmail.com';

