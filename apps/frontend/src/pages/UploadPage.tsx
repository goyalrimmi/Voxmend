import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUploadUrl, uploadVideoToStorage, registerVideo } from "../api/upload.api";


export default function UploadPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [requestingUrl, setRequestingUrl] = useState(false);
    const [videoKey, setVideoKey] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!selectedFile) return;
        const startTime = Date.now();

        try {
            setUploading(true);
            setError("");
            setUploadProgress(0);
            setUploadComplete(false);
            setRequestingUrl(true);
            setVideoKey("");

            const data = await getUploadUrl(selectedFile.type);
            setVideoKey(data.videoKey);

            await uploadVideoToStorage(
                data.presignedUrl,
                selectedFile,
                setUploadProgress
            );

            const result = await registerVideo(
                selectedFile,
                data.videoKey
            );

            console.log("Video registered:", result.video);

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 800 - elapsed);

            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }

            setUploadComplete(true);

            // console.log("Presigned URL: ", data.presignedUrl);
            // console.log("Video Key: ", data.videoKey);
        } catch (error) {
            console.error("video upload failed:", error);
            setError("Video upload failed. Please try again.");
        }
        finally {
            setRequestingUrl(false);
            setUploading(false);
        }
    };

    const handleFileSelection = (file: File | null) => {
        setError("");
        setSelectedFile(null);
        setUploadComplete(false);
        setUploadProgress(0);
        setVideoKey("");

        if (!file) return;

        if (!file.type.startsWith("video/")) {
            setError("Please select a valid video file.");
            return;
        }

        setSelectedFile(file);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
            <div className="mx-auto max-w-3xl">
                <button onClick={() => navigate("/dashboard")}
                    className="mb-8 text-sm font-medium text-slate-600 hover:text-slate-900">
                    Back to Dashboard
                </button>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold">Upload a video</h1>
                    <p className="mt-2 text-sm text-slate-500">Select a video file to upload directly to cloudflare</p>
                    <div>
                        <h2 className="mt-4 text-lg font-semibold">Select your video</h2>
                        <div
                            onClick={() => fileInputRef.current?.click()}

                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}

                            onDragLeave={() => {
                                setIsDragging(false);
                            }}

                            onDrop={(event) => {
                                event.preventDefault();
                                setIsDragging(false);

                                const file = event.dataTransfer.files[0] ?? null;
                                handleFileSelection(file);
                            }}

                            className={`mt-8 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-10 text-center transition ${isDragging
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-300 hover:border-indigo-500 hover:bg-indigo-50" }`}>

                        <div className="text-4xl"></div>
                        <p className="mt-2 text-sm text-slate-500">Drag and drop or click to browse</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                handleFileSelection(file);

                                if (!file) return;

                                if (!file.type.startsWith("video/")) {
                                    setError("Please select a valid video file.");
                                    event.target.value = "";
                                    return;
                                }
                                setSelectedFile(file);
                            }}
                        />
                        {selectedFile && (
                            <p
                                className="mt-4 text-sm font-medium text-slate-700">
                                Selected: {selectedFile.name}
                            </p>
                        )}
                        {error && (
                            <p className="mt-4 text-sm font-medium text-red-600">
                                {error}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={!selectedFile || requestingUrl}
                            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {uploading ? "Uploading video..." : "Upload video"}
                        </button>
                        {
                            uploading && (
                                <div className="mt-6">
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">
                                            Uploading video...
                                        </span>
                                        <span className="text-slate-500">
                                            {uploadProgress}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                            style={{width: `${uploadProgress}%`}}
                                        />
                                    </div>
                                </div>
                            )
                        }
                        {
                            uploadComplete && (
                                <p className="mt-4 text-sm font-medium text-green-700">
                                    Video uploaded successfully to storage!
                                </p>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
