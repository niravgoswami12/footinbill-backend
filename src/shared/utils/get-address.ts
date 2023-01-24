import { Dictionary } from 'code-config/dist';
import { config } from 'dotenv';
import { Request } from 'express';
import { Client } from './get-client';

config();

const getAddressFrom = (ip: string, headers: Client['headers']) => {
  const isProxy = process.env.PROXY_ENABLED === 'true';

  return (
    (!isProxy && ip) || headers['x-forwarded-for'] || headers['x-real-ip'] || ip
  );
};

export const getAddress = (client: Request): string => {
  return getAddressFrom(client.ip, client.headers as Dictionary);
};
