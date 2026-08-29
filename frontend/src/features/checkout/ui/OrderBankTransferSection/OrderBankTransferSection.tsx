import { useRef, useState, type FormEvent } from 'react';
import { subirComprobanteOrder } from '@/entities/order/api/orderApi';
import type { OrderApi } from '@/entities/order';
// import {
//     getTransferComprobante,
//     saveTransferComprobante,
//     TRANSFER_COMPROBANTE_ACCEPT,
//     TRANSFER_COMPROBANTE_FORMATS_LABEL,
//     TRANSFER_COMPROBANTE_MAX_LABEL,
// } from '@/features/checkout/lib/transfer-order-storage';
import BankTransferAccounts from '../BankTransferAccounts/BankTransferAccounts';
import styles from './OrderBankTransferSection.module.css';

const TRANSFER_COMPROBANTE_ACCEPT = 'image/png,image/jpeg,application/pdf';
const TRANSFER_COMPROBANTE_MAX_LABEL = '5 MB';
const TRANSFER_COMPROBANTE_FORMATS_LABEL = 'PNG, JPG o PDF';
const TRANSFER_COMPROBANTE_MAX_BYTES = 5 * 1024 * 1024;


type OrderBankTransferSectionProps = {
    orden: OrderApi;
    onComprobanteSaved?: () => void;
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function OrderBankTransferSection({
    orden,
    onComprobanteSaved,
}: OrderBankTransferSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ordenActualizada, setOrdenActualizada] = useState(orden);
    //const [saved, setSaved] = useState(() => Boolean(getTransferComprobante(orden.id)));
    //const comprobante = getTransferComprobante(orden.id);

    const comprobanteUrl = ordenActualizada.comprobanteUrl;
    const comprobanteNombre = ordenActualizada.comprobanteNombre;
    const comprobanteFecha = ordenActualizada.comprobanteFecha;

    const handleFileChange = (next: File | null) => {
        if (next && next.size > TRANSFER_COMPROBANTE_MAX_BYTES) {
            setError(`El archivo supera los ${TRANSFER_COMPROBANTE_MAX_LABEL}`);
            setFile(null);
            return;
        }
        setFile(next);
        setError(null);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!file) {
            setError('Selecciona un archivo de comprobante');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const updated = await subirComprobanteOrder(orden.id, file);
            setOrdenActualizada(updated);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onComprobanteSaved?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Error al subir el comprobante'
            );
        } finally {
            setUploading(false);
        }

        //const result = await saveTransferComprobante(orden.id, file);
        //setUploading(false);

        // if (!result.success) {
        //     setError(result.error);
        //     return;
        // }

        // setSaved(true);
        // setFile(null);
        // if (fileInputRef.current) {
        //     fileInputRef.current.value = '';
        // }
        // onComprobanteSaved?.();
    };

    return (
        <section className={styles.root} aria-labelledby={`transfer-title-${orden.id}`}>
            <h4 id={`transfer-title-${orden.id}`} className={styles.title}>
                Pago por transferencia bancaria
            </h4>
            <p className={styles.subtitle}>
                Transfiere el total a una de estas cuentas. Luego sube el comprobante para que
                podamos validar tu pago.
            </p>

            <BankTransferAccounts orderId={orden.id} total={orden.total} compact />

            <form className={styles.upload} onSubmit={handleSubmit}>
                <div className={styles.uploadHeader}>
                    <label className={styles.uploadLabel} htmlFor={`comprobante-${orden.id}`}>
                        Comprobante de transferencia
                    </label>
                    <p className={styles.uploadHint}>
                        {TRANSFER_COMPROBANTE_FORMATS_LABEL} · peso máximo{' '}
                        <strong>{TRANSFER_COMPROBANTE_MAX_LABEL}</strong>
                    </p>
                </div>

                <div className={styles.dropzone}>
                    <input
                        ref={fileInputRef}
                        id={`comprobante-${orden.id}`}
                        type="file"
                        accept={TRANSFER_COMPROBANTE_ACCEPT}
                        className={styles.fileInputHidden}
                        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    />

                    <div className={styles.dropzoneInner}>
                        <span className={styles.dropzoneIcon} aria-hidden="true">
                            {file ? '📄' : '📤'}
                        </span>
                        {file ? (
                            <>
                                <p className={styles.fileName}>{file.name}</p>
                                <p className={styles.fileMeta}>{formatFileSize(file.size)}</p>
                            </>
                        ) : (
                            <p className={styles.dropzoneText}>
                                Selecciona una imagen o PDF de tu comprobante
                            </p>
                        )}
                        <button
                            type="button"
                            className={styles.pickBtn}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {file ? 'Cambiar archivo' : 'Elegir archivo'}
                        </button>
                    </div>
                </div>

                {comprobanteUrl && (
                    <div className={styles.preview}>
                        <span className={styles.previewLabel}>Comprobante enviado</span>
                        <a
                            href={comprobanteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.previewLink}
                        >
                            {comprobanteNombre ?? 'Ver Comprobante'}
                        </a>
                        {comprobanteFecha && (
                            <p className={styles.previewMeta}>
                                {new Date(comprobanteFecha).toLocaleString('es-CL')}
                            </p>
                        )}
                    </div>
                )}

                {error && (
                    <p className={styles.errorMsg} role="alert">
                        {error}
                    </p>
                )}

                {comprobanteUrl && !error && (
                    <p className={styles.successMsg} role="status">
                        Comprobante guardado. Validaremos tu pago pronto.
                    </p>
                )}

                <div className={styles.actions}>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={uploading || !file}
                    >
                        {uploading
                            ? 'Enviando…'
                            : comprobanteUrl
                            ? 'Actualizar comprobante'
                            : 'Enviar comprobante'}
                    </button>
                </div>
            </form>
        </section>
    );
}
