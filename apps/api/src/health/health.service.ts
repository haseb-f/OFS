import { Injectable } from '@nestjs/common';
import { validateConnection, validateReadConnection } from '@ofs/database';
import { formatDate } from '@ofs/utils';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  app: string;
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    readReplica: 'connected' | 'disconnected' | 'fallback';
  };
}

@Injectable()
export class HealthService {
  async check(): Promise<HealthStatus> {
    const [dbStatus, readStatus] = await Promise.allSettled([
      validateConnection(),
      validateReadConnection(),
    ]);

    const database: 'connected' | 'disconnected' =
      dbStatus.status === 'fulfilled' ? 'connected' : 'disconnected';

    const readReplica: 'connected' | 'disconnected' | 'fallback' =
      readStatus.status === 'fulfilled' ? readStatus.value : 'disconnected';

    const isHealthy = database === 'connected';

    return {
      status: isHealthy ? 'ok' : 'degraded',
      app: 'api',
      timestamp: formatDate(new Date(), 'en'),
      services: { database, readReplica },
    };
  }
}
