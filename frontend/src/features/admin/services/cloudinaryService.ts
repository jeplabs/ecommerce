export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
}

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ofnjzaga';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ecommerce_productos';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export class CloudinaryUploadError extends Error {
    constructor(message: string, public readonly status?: number) {
        super(message);
        this.name = 'CloudinaryUploadError';
    }
}

/**
 * Valida que el archivo cumpla con los formatos permitidos y tamaño máximo.
 */
export function validateImageFile(file: File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        throw new CloudinaryUploadError(
            `Formato no permitido (${file.type}). Solo se admiten JPG, PNG y WebP.`
        );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        throw new CloudinaryUploadError(
            `El archivo es demasiado pesado (${sizeMb}MB). El tamaño máximo permitido es de 10MB.`
        );
    }
}

/**
 * Sube una imagen directamente a Cloudinary mediante Unsigned Upload con seguimiento de progreso.
 */
export function uploadImageToCloudinary(
    file: File,
    onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        try {
            validateImageFile(file);
        } catch (err) {
            reject(err);
            return;
        }

        const cloudName = CLOUDINARY_CLOUD_NAME;
        const uploadPreset = CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            reject(
                new CloudinaryUploadError(
                    'Configuración incompleta: VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET no están definidos.'
                )
            );
            return;
        }

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);

        // Seguimiento de progreso
        if (xhr.upload && onProgress) {
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
                    const response = JSON.parse(xhr.responseText) as CloudinaryUploadResult;
                    resolve(response);
                } catch {
                    reject(new CloudinaryUploadError('Error al procesar la respuesta de Cloudinary.', xhr.status));
                }
            } else {
                let errorMsg = 'Error al subir la imagen a Cloudinary.';
                try {
                    const parsed = JSON.parse(xhr.responseText);
                    if (parsed.error?.message) {
                        errorMsg = parsed.error.message;
                    }
                } catch {
                    // Fallback
                }
                reject(new CloudinaryUploadError(errorMsg, xhr.status));
            }
        };

        xhr.onerror = () => {
            reject(new CloudinaryUploadError('Error de red al conectar con Cloudinary.'));
        };

        xhr.ontimeout = () => {
            reject(new CloudinaryUploadError('Tiempo de espera agotado al subir a Cloudinary.'));
        };

        xhr.send(formData);
    });
}
