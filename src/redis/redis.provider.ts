import * as Redis from 'ioredis';
import { RedisModuleOptions } from './redis.interface';
import { Provider } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.constants';
import { v4 as uuidv4 } from 'uuid';

export class RedisClientError extends Error { }
export interface RedisClient {
    defaultKey: string,
    clients: Map<string, Redis.Redis>,
    size: number,
}

async function getClient(options: RedisModuleOptions): Promise<Redis.Redis> {
    const { onClientReady, url, ...opt } = options
    const client = url ? new Redis.default(url) : new Redis.default(opt);
    if (onClientReady) {
        onClientReady(client)
    }
    return client;
}

export const createClient = (): Provider => ({
    provide: REDIS_CLIENT,
    useFactory: async (options: RedisModuleOptions | RedisModuleOptions[]): Promise<RedisClient> => {
        const clients = new Map<string, Redis.Redis>();
        let defaultKey = uuidv4()
        if (Array.isArray(options)) {
            await Promise.all(
                options.map(async (option) => {
                    const key = option.name || defaultKey
                    if (clients.has(key)) {
                        throw new RedisClientError(`${option.name || 'default'} client is exists`)
                    }
                    clients.set(key, await getClient(option))
                })
            )
        } else {
            if (options.name && options.name.length !== 0) {
                defaultKey = options.name
            }
            clients.set(defaultKey, await getClient(options))
        }

        return {
            defaultKey,
            clients,
            size: clients.size
        }
    }
})