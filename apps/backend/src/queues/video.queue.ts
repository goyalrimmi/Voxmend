import { Queue } from "bullmq";
import redisConnection from "../utils/redis.js";

export const VIDEO_QUEUE_NAME = "video_processing_queue";

export const videoQueue = new Queue(VIDEO_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});
