import { Redis } from "ioredis";
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
    console.log("Connecting to Redis...");
});

redisConnection.on("ready", () => {
    console.log("Redis connection is established");
});

redisConnection.on("error", (error) => {
    console.error("Redis connection error", error.message);
});

export default redisConnection;
