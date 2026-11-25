import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, FieldError } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { uploadBannerToCloudinary } from '../../services/bannerCloudinaryService';
import {
    bannerFormSchema,
    type BannerApi,
    type CreateBannerRequest,
    type UpdateBannerRequest,
} from '../../types';
import styles from './BannerModalForm.module.css';

export interface BannerModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    bannerToEdit?: BannerApi | null;
    onSave: (payload: CreateBannerRequest | UpdateBannerRequest) => Promise<boolean>;
    isSaving?: boolean;
}

function toDateTimeLocal(iso?: string | null): string {
    if (!iso) return '';
    return iso.slice(0, 16);
}

function fromDateTimeLocal(val?: string | null): string | null {
    if (!val || !val.trim()) return null;
    return val.length === 16 ? `${val}:00` : val;
}

export function BannerModalForm({
    isOpen,
    onClose,
    bannerToEdit,
    onSave,
    isSaving = false,
}: BannerModalFormProps) {
    const isEditing = Boolean(bannerToEdit);

    const [titulo, setTitulo] = useState('');
    const [desktopUrl, setDesktopUrl] = useState('');
    const [mobileUrl, setMobileUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [activo, setActivo] = useState(true);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const [uploadingDesktop, setUploadingDesktop] = useState(false);
    const [desktopProgress, setDesktopProgress] = useState(0);

    const [uploadingMobile, setUploadingMobile] = useState(false);
    const [mobileProgress, setMobileProgress] = useState(0);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    const desktopFileRef = useRef<HTMLInputElement>(null);
    const mobileFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setTitulo('');
            setDesktopUrl('');
            setMobileUrl('');
            setLinkUrl('');
            setActivo(true);
            setFechaInicio('');
            setFechaFin('');
            setErrors({});
            setGeneralError(null);
            return;
        }

        if (bannerToEdit) {
            setTitulo(bannerToEdit.titulo);
            setDesktopUrl(bannerToEdit.desktopUrl);
            setMobileUrl(bannerToEdit.mobileUrl ?? '');
            setLinkUrl(bannerToEdit.linkUrl ?? '');
            setActivo(bannerToEdit.activo);
            setFechaInicio(toDateTimeLocal(bannerToEdit.fechaInicio));
            setFechaFin(toDateTimeLocal(bannerToEdit.fechaFin));
        } else {
            setTitulo('');
            setDesktopUrl('');
            setMobileUrl('');
            setLinkUrl('');
            setActivo(true);
            setFechaInicio('');
            setFechaFin('');
        }
        setErrors({});
        setGeneralError(null);
    }, [isOpen, bannerToEdit]);

    if (!isOpen) return null;

    const handleFileUpload = async (
        file: File,
        target: 'desktop' | 'mobile'
    ) => {
        setGeneralError(null);
        if (target === 'desktop') {
            setUploadingDesktop(true);
            setDesktopProgress(0);
        } else {
            setUploadingMobile(true);
            setMobileProgress(0);
        }

        try {
            const result = await uploadBannerToCloudinary(file, (percent) => {
                if (target === 'desktop') setDesktopProgress(percent);
                else setMobileProgress(percent);
            });

            if (target === 'desktop') {
                setDesktopUrl(result.secure_url);
                setErrors((prev) => ({ ...prev, desktopUrl: '' }));
            } else {
                setMobileUrl(result.secure_url);
                setErrors((prev) => ({ ...prev, mobileUrl: '' }));
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al subir imagen a Cloudinary';
            setGeneralError(msg);
        } finally {
            if (target === 'desktop') setUploadingDesktop(false);
            else setUploadingMobile(false);
        }
    };

    const handleDesktopFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) void handleFileUpload(file, 'desktop');
    };

    const handleMobileFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) void handleFileUpload(file, 'mobile');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setGeneralError(null);

        const rawValues = {
            seccion: bannerToEdit?.seccion ?? ('HERO_CAROUSEL' as const),
            titulo,
            desktopUrl,
            mobileUrl: mobileUrl || undefined,
            linkUrl: linkUrl || undefined,
            activo,
            fechaInicio: fromDateTimeLocal(fechaInicio),
            fechaFin: fromDateTimeLocal(fechaFin),
        };

        const parsed = bannerFormSchema.safeParse(rawValues);
        if (!parsed.success) {
            const newErrors: Record<string, string> = {};
            parsed.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                if (path && !newErrors[path]) {
                    newErrors[path] = issue.message;
                }
            });
            setErrors(newErrors);
            return;
        }

        const payload: CreateBannerRequest = {
            seccion: parsed.data.seccion,
            titulo: parsed.data.titulo,
            desktopUrl: parsed.data.desktopUrl,
            mobileUrl: parsed.data.mobileUrl || null,
            linkUrl: parsed.data.linkUrl || null,
            activo: parsed.data.activo,
            fechaInicio: parsed.data.fechaInicio || null,
            fechaFin: parsed.data.fechaFin || null,
        };

        const success = await onSave(payload);
        if (success) {
            onClose();
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="banner-modal-title"
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 id="banner-modal-title">
                        {isEditing ? 'Editar banner' : 'Nuevo banner para Home'}
                    </h2>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.body}>
                        {generalError && (
                            <div className={styles.errorBanner} role="alert">
                                {generalError}
                            </div>
                        )}

                        {/* Título de la campaña */}
                        <FormField label="Título descriptivo del banner" htmlFor="banner-titulo">
                            <Input
                                id="banner-titulo"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ej. Promoción de Verano 2026"
                                required
                            />
                            {errors.titulo && <FieldError>{errors.titulo}</FieldError>}
                        </FormField>

                        {/* Imagen Desktop */}
                        <div className={styles.uploadGroup}>
                            <FormField label="Imagen para escritorio (Desktop)" htmlFor="banner-desktop-url">
                                <div className={styles.inputWithUpload}>
                                    <Input
                                        id="banner-desktop-url"
                                        value={desktopUrl}
                                        onChange={(e) => setDesktopUrl(e.target.value)}
                                        placeholder="https://... o sube un archivo"
                                        required
                                    />
                                    <input
                                        type="file"
                                        ref={desktopFileRef}
                                        className={styles.fileInputHidden}
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleDesktopFileChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className={styles.uploadBtn}
                                        disabled={uploadingDesktop}
                                        onClick={() => desktopFileRef.current?.click()}
                                    >
                                        {uploadingDesktop ? `${desktopProgress}%` : '📁 Subir'}
                                    </Button>
                                </div>
                                <p className={styles.hint}>
                                    Recomendado: 1920×600 px (panorámico). Formatos: WebP, PNG, JPG hasta 10MB.
                                </p>
                                {uploadingDesktop && (
                                    <div className={styles.progressWrap}>
                                        <div
                                            className={styles.progressBar}
                                            style={{ width: `${desktopProgress}%` }}
                                        />
                                    </div>
                                )}
                                {errors.desktopUrl && <FieldError>{errors.desktopUrl}</FieldError>}
                            </FormField>
                            {desktopUrl && (
                                <div className={styles.imagePreview}>
                                    <img
                                        src={desktopUrl}
                                        alt="Vista previa Desktop"
                                        className={styles.previewImg}
                                    />
                                    <button
                                        type="button"
                                        className={styles.previewRemoveBtn}
                                        onClick={() => setDesktopUrl('')}
                                        title="Quitar imagen"
                                        aria-label="Quitar imagen desktop"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Imagen Mobile */}
                        <div className={styles.uploadGroup}>
                            <FormField label="Imagen para móviles (Mobile — Opcional)" htmlFor="banner-mobile-url">
                                <div className={styles.inputWithUpload}>
                                    <Input
                                        id="banner-mobile-url"
                                        value={mobileUrl}
                                        onChange={(e) => setMobileUrl(e.target.value)}
                                        placeholder="https://... (opcional)"
                                    />
                                    <input
                                        type="file"
                                        ref={mobileFileRef}
                                        className={styles.fileInputHidden}
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleMobileFileChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className={styles.uploadBtn}
                                        disabled={uploadingMobile}
                                        onClick={() => mobileFileRef.current?.click()}
                                    >
                                        {uploadingMobile ? `${mobileProgress}%` : '📁 Subir'}
                                    </Button>
                                </div>
                                <p className={styles.hint}>
                                    Recomendado: 800×800 px (cuadrado). Se mostrará en pantallas ≤ 768px.
                                </p>
                                {uploadingMobile && (
                                    <div className={styles.progressWrap}>
                                        <div
                                            className={styles.progressBar}
                                            style={{ width: `${mobileProgress}%` }}
                                        />
                                    </div>
                                )}
                                {errors.mobileUrl && <FieldError>{errors.mobileUrl}</FieldError>}
                            </FormField>
                            {mobileUrl && (
                                <div className={styles.imagePreview}>
                                    <img
                                        src={mobileUrl}
                                        alt="Vista previa Mobile"
                                        className={styles.previewImg}
                                    />
                                    <button
                                        type="button"
                                        className={styles.previewRemoveBtn}
                                        onClick={() => setMobileUrl('')}
                                        title="Quitar imagen mobile"
                                        aria-label="Quitar imagen mobile"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Enlace de Destino */}
                        <FormField label="Enlace al hacer clic (Opcional)" htmlFor="banner-link-url">
                            <Input
                                id="banner-link-url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="Ej. /categoria/computacion o https://promocion.cl"
                            />
                            <p className={styles.hint}>
                                Admite rutas relativas internas (/categoria/audio) o URLs externas (https://...).
                            </p>
                            {errors.linkUrl && <FieldError>{errors.linkUrl}</FieldError>}
                        </FormField>

                        {/* Fechas de vigencia */}
                        <div className={styles.row2Col}>
                            <FormField label="Fecha y hora de inicio (Opcional)" htmlFor="banner-fecha-inicio">
                                <Input
                                    id="banner-fecha-inicio"
                                    type="datetime-local"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                />
                            </FormField>

                            <FormField label="Fecha y hora de fin (Opcional)" htmlFor="banner-fecha-fin">
                                <Input
                                    id="banner-fecha-fin"
                                    type="datetime-local"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                />
                                {errors.fechaFin && <FieldError>{errors.fechaFin}</FieldError>}
                            </FormField>
                        </div>

                        {/* Estado Activo */}
                        <label className={styles.checkboxField}>
                            <input
                                type="checkbox"
                                checked={activo}
                                onChange={(e) => setActivo(e.target.checked)}
                            />
                            <span>Banner activo inmediatamente en el carrusel</span>
                        </label>
                    </div>

                    <div className={styles.footer}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSaving || uploadingDesktop || uploadingMobile}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSaving || uploadingDesktop || uploadingMobile}
                        >
                            {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear banner'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
