export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
}

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ofnjzaga';
const CLOUDINARY_BANNER_PRESET = import.meta.env.VITE_CLOUDINARY_BANNER_PRESET || 'ecommerce_banners';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB para banners de alta resolución
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export class CloudinaryUploadError extends Error {
    constructor(message: string, public readonly status?: number) {
        super(message);
        this.name = 'CloudinaryUploadError';
    }
}

/**
 * Valida que el archivo de imagen para banner cumpla con los formatos permitidos y tamaño máximo.
 */
export function validateBannerFile(file: File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        throw new CloudinaryUploadError(
            `Formato no permitido (${file.type}). Solo se admiten JPG, PNG y WebP.`
        );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        throw new CloudinaryUploadError(
            `El archivo es demasiado pesado (${sizeMb}MB). El tamaño máximo permitido para banners es de 10MB.`
        );
    }
}

/**
 * Sube una imagen de banner directamente a Cloudinary mediante Unsigned Upload con seguimiento de progreso.
 */
export function uploadBannerToCloudinary(
    file: File,
    onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        try {
            validateBannerFile(file);
        } catch (err) {
            reject(err);
            return;
        }

        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_BANNER_PRESET);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);

        if (onProgress && xhr.upload) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText) as CloudinaryUploadResult;
                    resolve(data);
                } catch {
                    reject(new CloudinaryUploadError('Respuesta inválida del servidor de Cloudinary'));
                }
            } else {
                let errorMsg = `Error al subir imagen (${xhr.status})`;
                try {
                    const errData = JSON.parse(xhr.responseText);
                    if (errData?.error?.message) {
                        errorMsg = errData.error.message;
                    }
                } catch {
                    // Mantener mensaje por defecto
                }
                reject(new CloudinaryUploadError(errorMsg, xhr.status));
            }
        };

        xhr.onerror = () => {
            reject(new CloudinaryUploadError('Error de red al conectar con Cloudinary'));
        };

        xhr.ontimeout = () => {
            reject(new CloudinaryUploadError('Tiempo de espera agotado al subir imagen'));
        };

        xhr.send(formData);
    });
}
