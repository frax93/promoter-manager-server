import dotenv from 'dotenv';

dotenv.config();

export const __PORT__ = process.env.PORT || 8000;

export const __ORIGIN__ = process.env.ORIGIN || 'http://localhost:8081';

export const __BASE_PATH__ = process.env.BASE_PATH || "/api"; 

export const __DATABASE_URL__ =
  process.env.DATABASE_URL ||
  "postgres://up1bpla284aq5:p04b593cf97779ca3da0d18d1c0553cafa8de08c2c9636cb6ae9e5b9e99e49323@c3nv2ev86aje4j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d5au65924vsoc4";

export const __DATABASE_SCHEMA__ =
  process.env.DATABASE_SCHEMA || "promoter_manager";

export const __JWT_SECRET__ =
  process.env.JWT_SECRET ||
  "cd844fbaf51642dd4f14c498d8808fb540018f67f3acccf8455e864b3e0a2abe9987dde3180cfc0eb0becc9b64bd744001830de8c3427eae6c99e51731b88e3c";

/** Client Email */
export const __CLIENT_ID__ = process.env.CLIENT_ID || '';

export const __REFRESH_TOKEN_ = process.env.REFRESH_TOKEN || '';

export const __CLIENT_SECRET__ = process.env.CLIENT_SECRET || '';

export const __EMAIL_USER__ = process.env.EMAIL_USER || '';

/** Server urls */
export const __WEB_APP_URL__ = process.env.WEB_APP_URL || '';
export const __BACKEND_APP_URL__ = process.env.BACKEND_APP_URL || '';

