import { DynamicModule, Global, Inject, Module, OnModuleDestroy } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from "./redis.constants";
import { RedisModuleOptions } from "./redis.interface";
import { RedisClient } from "ioredis/built/connectors/SentinelConnector/types";

@Global()
@Module({
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisCoreModule implements OnModuleDestroy {
    constructor(
        @Inject(REDIS_MODULE_OPTIONS)
        private readonly options: RedisModuleOptions | RedisModuleOptions[],
        @Inject(REDIS_CLIENT)
        private readonly redisClient: RedisClient,
    ) { }

    static register(
        options: RedisModuleOptions | RedisModuleOptions[]
    ): DynamicModule {
        return {
            module: RedisCoreModule,
            providers: [
                createCl
            ]
        }
    }
}