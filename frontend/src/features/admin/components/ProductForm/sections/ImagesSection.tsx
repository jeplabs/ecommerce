import { useState, useRef, type DragEvent, type ChangeEvent, type MouseEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FormField';
import type { AdminProductFormImage } from '../../../lib/product-image-admin';
import { uploadImageToCloudinary, CloudinaryUploadError } from '../../../services/cloudinaryService';
import styles from '../ProductForm.module.css';

interface ImagesSectionProps {
    images: AdminProductFormImage[];
    urlInput: string;
    error?: string | null;
    onUrlInputChange: (value: string) => void;
    onAddUrl: () => void;
    onAddUploadedUrls: (urls: string[]) => void;
    onRemove: (id: string | number) => void;
    onSetPrincipal: (id: string) => void;
}

export function ImagesSection({
    images,
    urlInput,
    error,
    onUrlInputChange,
    onAddUrl,
    onAddUploadedUrls,
    onRemove,
    onSetPrincipal,
}: ImagesSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percent: number } | null>(null);
    const [localUploadError, setLocalUploadError] = useState<string | null>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isUploading) setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFiles = async (fileList: FileList | File[]) => {
        const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
        if (files.length === 0) {
            setLocalUploadError('Por favor selecciona al menos un archivo de imagen válido (JPG, PNG o WebP).');
            return;
        }

        setIsUploading(true);
        setLocalUploadError(null);

        const uploadedUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress({ current: i + 1, total: files.length, percent: 0 });

            try {
                const result = await uploadImageToCloudinary(file, (percent) => {
                    setUploadProgress({ current: i + 1, total: files.length, percent });
                });
                uploadedUrls.push(result.secure_url);
            } catch (err) {
                const msg = err instanceof CloudinaryUploadError || err instanceof Error ? err.message : 'Error desconocido al subir';
                setLocalUploadError(`Error al subir "${file.name}": ${msg}`);
                break;
            }
        }

        if (uploadedUrls.length > 0) {
            onAddUploadedUrls(uploadedUrls);
        }

        setIsUploading(false);
        setUploadProgress(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (isUploading) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            void processFiles(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            void processFiles(e.target.files);
        }
    };

    const handleOpenFileDialog = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            {/* Input oculto para selección de archivos */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
            />

            {/* Zona Drag & Drop para Cloudinary */}
            <div
                className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${
                    isUploading ? styles.dropzoneDisabled : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleOpenFileDialog}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenFileDialog()}
                aria-label="Subir imágenes a Cloudinary"
            >
                <div className={styles.dropzoneIcon}>☁️</div>
                <div className={styles.dropzoneText}>
                    {isUploading
                        ? 'Subiendo a Cloudinary…'
                        : isDragging
                        ? '¡Suelta las imágenes aquí!'
                        : 'Arrastra tus imágenes aquí o haz clic para explorar'}
                </div>
                <div className={styles.dropzoneSub}>
                    JPG, PNG, WebP · Hasta 10MB · Optimización automática en Cloudinary
                </div>
            </div>

            {/* Barra de progreso de subida */}
            {uploadProgress && (
                <div className={styles.progressContainer}>
                    <div className={styles.progressHeader}>
                        <span>
                            Subiendo imagen {uploadProgress.current} de {uploadProgress.total}…
                        </span>
                        <span>{uploadProgress.percent}%</span>
                    </div>
                    <div className={styles.progressBarTrack}>
                        <div
                            className={styles.progressBarFill}
                            style={{ width: `${uploadProgress.percent}%` }}
                        />
                    </div>
                </div>
            )}

            {localUploadError && <FieldError>{localUploadError}</FieldError>}

            {/* Divisor con opción de URL manual */}
            <div className={styles.manualUrlHeader}>o ingresa una URL manualmente</div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <Input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={urlInput}
                    onChange={(e) => onUrlInputChange(e.target.value)}
                    style={{ flex: 1 }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddUrl())}
                />
                <Button
                    type="button"
                    variant="primary"
                    onClick={onAddUrl}
                    style={{ width: '140px' }}
                >
                    Agregar URL
                </Button>
            </div>

            {error && <FieldError>{error}</FieldError>}

            {/* Grid de imágenes cargadas */}
            {images.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: '0.8rem',
                        marginTop: '1rem',
                    }}
                >
                    {images.map((img) => (
                        <div key={img.id} style={{ position: 'relative' }}>
                            <img
                                src={img.preview}
                                alt="Vista previa"
                                style={{
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: img.principal
                                        ? '3px solid #10b981'
                                        : '1px solid var(--border, rgba(255,255,255,0.1))',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                }}
                            />

                            {img.principal && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: '#10b981',
                                        color: 'white',
                                        fontSize: '10px',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    PRINCIPAL
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() => onRemove(img.id)}
                                style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: '2px solid #1a2235',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseOver={(e: MouseEvent<HTMLButtonElement>) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseOut={(e: MouseEvent<HTMLButtonElement>) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                aria-label="Eliminar imagen"
                            >
                                &times;
                            </button>

                            {!img.principal && (
                                <button
                                    type="button"
                                    onClick={() => onSetPrincipal(String(img.id))}
                                    title="Marcar como principal"
                                    style={{
                                        position: 'absolute',
                                        bottom: '-6px',
                                        right: '-6px',
                                        background: '#3b82f6',
                                        color: 'white',
                                        border: '2px solid #1a2235',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        zIndex: 10,
                                    }}
                                >
                                    ★
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </fieldset>
    );
}
