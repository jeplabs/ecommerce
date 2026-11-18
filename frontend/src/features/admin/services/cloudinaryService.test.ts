import { describe, expect, it, vi, afterEach } from 'vitest';
import {
    validateImageFile,
    uploadImageToCloudinary,
    CloudinaryUploadError,
} from './cloudinaryService';

describe('cloudinaryService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('validateImageFile', () => {
        it('acepta formatos permitidos menores a 10MB', () => {
            const validJpg = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
            const validPng = new File(['dummy content'], 'photo.png', { type: 'image/png' });
            const validWebp = new File(['dummy content'], 'photo.webp', { type: 'image/webp' });

            expect(() => validateImageFile(validJpg)).not.toThrow();
            expect(() => validateImageFile(validPng)).not.toThrow();
            expect(() => validateImageFile(validWebp)).not.toThrow();
        });

        it('lanza error si el formato no es de imagen admitido', () => {
            const pdfFile = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });
            expect(() => validateImageFile(pdfFile)).toThrow(CloudinaryUploadError);
            expect(() => validateImageFile(pdfFile)).toThrow(/Formato no permitido/);
        });

        it('lanza error si el archivo excede los 10MB', () => {
            const bigFile = new File(['x'.repeat(100)], 'big.jpg', { type: 'image/jpeg' });
            Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 });

            expect(() => validateImageFile(bigFile)).toThrow(CloudinaryUploadError);
            expect(() => validateImageFile(bigFile)).toThrow(/demasiado pesado/);
        });
    });

    describe('uploadImageToCloudinary', () => {
        it('sube archivo exitosamente y notifica progreso', async () => {
            const mockXHR = {
                open: vi.fn(),
                send: vi.fn(function (this: {
                    status: number;
                    responseText: string;
                    onload: () => void;
                    upload: { onprogress: (e: { lengthComputable: boolean; loaded: number; total: number }) => void };
                }) {
                    if (this.upload.onprogress) {
                        this.upload.onprogress({ lengthComputable: true, loaded: 50, total: 100 });
                    }
                    this.status = 200;
                    this.responseText = JSON.stringify({
                        secure_url: 'https://res.cloudinary.com/ofnjzaga/image/upload/v123/productos/test.webp',
                        public_id: 'productos/test',
                        format: 'webp',
                        width: 800,
                        height: 800,
                        bytes: 12345,
                    });
                    this.onload();
                }),
                upload: {
                    onprogress: null as unknown,
                },
                status: 0,
                responseText: '',
                onload: vi.fn(),
                onerror: vi.fn(),
                ontimeout: vi.fn(),
            };

            vi.stubGlobal('XMLHttpRequest', function () {
                return mockXHR;
            });

            const onProgress = vi.fn();
            const file = new File(['test'], 'test.png', { type: 'image/png' });

            const result = await uploadImageToCloudinary(file, onProgress);

            expect(result.secure_url).toBe('https://res.cloudinary.com/ofnjzaga/image/upload/v123/productos/test.webp');
            expect(onProgress).toHaveBeenCalledWith(50);
            expect(mockXHR.open).toHaveBeenCalledWith('POST', expect.stringContaining('/image/upload'));
        });

        it('lanza CloudinaryUploadError cuando el servidor responde con error', async () => {
            const mockXHR = {
                open: vi.fn(),
                send: vi.fn(function (this: {
                    status: number;
                    responseText: string;
                    onload: () => void;
                }) {
                    this.status = 400;
                    this.responseText = JSON.stringify({
                        error: { message: 'Upload preset not found' },
                    });
                    this.onload();
                }),
                upload: {},
                status: 0,
                responseText: '',
                onload: vi.fn(),
                onerror: vi.fn(),
                ontimeout: vi.fn(),
            };

            vi.stubGlobal('XMLHttpRequest', function () {
                return mockXHR;
            });

            const file = new File(['test'], 'test.png', { type: 'image/png' });

            await expect(uploadImageToCloudinary(file)).rejects.toThrow(CloudinaryUploadError);
            await expect(uploadImageToCloudinary(file)).rejects.toThrow('Upload preset not found');
        });
    });
});
