import { api } from "./axios";
import axios from "axios";

type UploadUrlResponse = {
    presignedUrl: string;
    videoKey: string;
};

type RegisterVideoResponse = {
    success: boolean;
    message: string;
    video: {
        id: string;
        fileName: string;
        storageKey: string;
        contentType: string;
        size: number;
        userId: string;
        createdAt: string;
    };
};


export const getUploadUrl = async (contentType: string): Promise<UploadUrlResponse> => {
    const response = await api.post<UploadUrlResponse>("/upload-url", {
        contentType,
    });

    return response.data;
};

export const uploadVideoToStorage = async (
    presignedUrl: string,
    file: File,
    onProgress: (progress: number) => void
) => {
    await axios.put(presignedUrl, file, {
        headers: {
            "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percentage = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );

                onProgress(percentage);
            }
        },
    });
};

export const registerVideo = async (
    file: File,
    storageKey: string
): Promise<RegisterVideoResponse> => {
    const response = await api.post<RegisterVideoResponse>("/videos", {
        fileName: file.name,
        storageKey,
        contentType: file.type,
        size: file.size,
    });

    return response.data;
}
