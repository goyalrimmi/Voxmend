import { Request, Response } from "express";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import prisma from "../config/prisma.js";
import { s3Client } from "../config/s3.js";

const bucketName = process.env.S3_BUCKET_NAME;

export async function registerVideo(req: Request, res: Response) {
    try {
        const { fileName, storageKey, contentType, size } = req.body;

        if (
            typeof fileName !== "string" ||
            typeof storageKey !== "string" ||
            typeof contentType !== "string" ||
            typeof size !== "number"
        ) {
            return res.status(400).json({
                message: "Invalid video registration data",
            });
        }

        if (
            !fileName.trim() ||
            !storageKey.startsWith("videos/") ||
            !contentType.startsWith("video/") ||
            !Number.isSafeInteger(size) ||
            size <= 0
        ) {
            return res.status(400).json({
                message: "Invalid video registration data",
            });
        }

        const userId = req.user?.id;

        if (!userId || !storageKey.startsWith(`videos/${userId}/`)) {
            return res.status(403).json({
                message: "You are not authorized to register this video",
            });
        }

        if (!bucketName) {
            return res.status(500).json({
                message: "S3 bucket configuration is missing",
            });
        }

        const object = await s3Client.send(
            new HeadObjectCommand({
                Bucket: bucketName,
                Key: storageKey,
            })
        );

        if (
            object.ContentType !== contentType ||
            object.ContentLength !== size
        ) {
            return res.status(400).json({
                message: "Uploaded video metadata doesn't match",
            });
        }

        const video = await prisma.video.create({
            data: {
                fileName,
                storageKey,
                contentType,
                size,
                userId,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Video registered successfully",
            video,
        });

    } catch (error) {
        if (
            error instanceof Error &&
            error.name === "NotFound"
        ) {
            return res.status(404).json({
                message: "Uploaded video not found in storage",
            });
        }

        console.error("Failed to register video:", error);

        return res.status(500).json({
            message: "Failed to register video",
        });
    }
}
