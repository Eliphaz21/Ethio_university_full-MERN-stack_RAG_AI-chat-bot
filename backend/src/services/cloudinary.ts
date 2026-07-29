import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../config/env.js';

function cleanEnvVar(val?: string): string {
    if (!val) return '';
    return val.trim().replace(/^["']|["']$/g, '');
}

function getCloudinaryCredentials() {
    const cloud_name = cleanEnvVar(process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME);
    const api_key = cleanEnvVar(process.env.CLOUDINARY_API_KEY || CLOUDINARY_API_KEY);
    const api_secret = cleanEnvVar(process.env.CLOUDINARY_API_SECRET || CLOUDINARY_API_SECRET);

    return { cloud_name, api_key, api_secret };
}

export function isCloudinaryConfigured(): boolean {
    const { cloud_name, api_key, api_secret } = getCloudinaryCredentials();
    return Boolean(cloud_name && api_key && api_secret);
}

function ensureCloudinaryConfigured() {
    const { cloud_name, api_key, api_secret } = getCloudinaryCredentials();
    if (!cloud_name || !api_key || !api_secret) {
        throw new Error('Cloudinary environment variables are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env and restart the backend server.');
    }
    cloudinary.config({
        cloud_name,
        api_key,
        api_secret,
        secure: true,
    });
}

export function extractPublicIdFromUrl(url: string): string | null {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        const pathAfterUpload = parts[1];
        const pathParts = pathAfterUpload.split('/');
        const cleanParts = pathParts.filter(p => !p.startsWith('v1') && !p.includes(',') && !p.startsWith('v2'));
        const filenameWithExt = cleanParts.join('/');
        const lastDotIndex = filenameWithExt.lastIndexOf('.');
        if (lastDotIndex === -1) return filenameWithExt;
        return filenameWithExt.substring(0, lastDotIndex);
    } catch {
        return null;
    }
}

export function getCloudinaryPublicUrl(publicId: string) {
    if (!isCloudinaryConfigured()) return null;
    ensureCloudinaryConfigured();
    return cloudinary.url(publicId, { secure: true });
}

export interface CloudinaryUploadOptions {
    publicId?: string;
    folder?: string;
}

export async function uploadBufferToCloudinary(buffer: Buffer, options: CloudinaryUploadOptions = {}) {
    ensureCloudinaryConfigured();

    const { publicId, folder = 'ethiouni-universities' } = options;
    const upload_preset = cleanEnvVar(process.env.CLOUDINARY_UPLOAD_PRESET);

    const uploadParams: any = {
        public_id: publicId,
        folder,
        resource_type: 'image',
    };

    if (upload_preset) {
        uploadParams.upload_preset = upload_preset;
    }

    return new Promise<{ secure_url: string; public_id: string; format: string; width: number; height: number }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            uploadParams,
            (error, result) => {
                if (error || !result) {
                    console.error('Cloudinary API upload error details:', error);
                    let message = error?.message || 'Cloudinary upload failed';
                    if (message.includes('Invalid Signature') || (error as any)?.http_code === 401) {
                        message = 'Cloudinary authentication failed (Invalid Signature / 401). Verify that the credentials in backend/.env match the Cloudinary dashboard.';
                    }
                    reject(new Error(message));
                    return;
                }
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                    format: result.format,
                    width: result.width,
                    height: result.height,
                });
            }
        );

        uploadStream.end(buffer);
    });
}

export async function deleteFromCloudinary(publicId: string) {
    if (!isCloudinaryConfigured() || !publicId) return null;
    try {
        ensureCloudinaryConfigured();
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (err) {
        console.warn('Failed to delete old image from Cloudinary:', err);
        return null;
    }
}


