const TRANSFER_ORDERS_KEY = 'ecommerce:ordenes-transferencia';
const COMPROBANTES_KEY = 'ecommerce:comprobantes-transferencia';

/** Límite demo en frontend; en producción validar también en el backend. */
export const TRANSFER_COMPROBANTE_MAX_BYTES = 2 * 1024 * 1024;
export const TRANSFER_COMPROBANTE_MAX_LABEL = '2 MB';
export const TRANSFER_COMPROBANTE_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';
export const TRANSFER_COMPROBANTE_FORMATS_LABEL = 'JPG, PNG, WEBP o PDF';

const MAX_COMPROBANTE_BYTES = TRANSFER_COMPROBANTE_MAX_BYTES;

type StoredComprobante = {
    fileName: string;
    mimeType: string;
    dataUrl: string;
    uploadedAt: string;
};

function readTransferOrderIds(): number[] {
    try {
        const raw = localStorage.getItem(TRANSFER_ORDERS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((id): id is number => typeof id === 'number');
    } catch {
        return [];
    }
}

function writeTransferOrderIds(ids: number[]) {
    localStorage.setItem(TRANSFER_ORDERS_KEY, JSON.stringify([...new Set(ids)]));
}

function readComprobantes(): Record<string, StoredComprobante> {
    try {
        const raw = localStorage.getItem(COMPROBANTES_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as Record<string, StoredComprobante>;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeComprobantes(map: Record<string, StoredComprobante>) {
    localStorage.setItem(COMPROBANTES_KEY, JSON.stringify(map));
}

/** Marca una orden como pagada por transferencia bancaria (solo frontend, hasta integrar backend). */
export function markOrderAsBankTransfer(orderId: number) {
    const ids = readTransferOrderIds();
    if (!ids.includes(orderId)) {
        writeTransferOrderIds([...ids, orderId]);
    }
}

export function isBankTransferOrder(orderId: number): boolean {
    return readTransferOrderIds().includes(orderId);
}

export function getTransferComprobante(orderId: number): StoredComprobante | null {
    return readComprobantes()[String(orderId)] ?? null;
}

export async function saveTransferComprobante(
    orderId: number,
    file: File
): Promise<{ success: true } | { success: false; error: string }> {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
        return { success: false, error: 'Usa JPG, PNG, WEBP o PDF' };
    }
    if (file.size > MAX_COMPROBANTE_BYTES) {
        return {
            success: false,
            error: `El archivo no puede superar ${TRANSFER_COMPROBANTE_MAX_LABEL}`,
        };
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = typeof reader.result === 'string' ? reader.result : '';
            if (!dataUrl) {
                resolve({ success: false, error: 'No se pudo leer el archivo' });
                return;
            }
            const map = readComprobantes();
            map[String(orderId)] = {
                fileName: file.name,
                mimeType: file.type,
                dataUrl,
                uploadedAt: new Date().toISOString(),
            };
            writeComprobantes(map);
            resolve({ success: true });
        };
        reader.onerror = () => resolve({ success: false, error: 'Error al leer el archivo' });
        reader.readAsDataURL(file);
    });
}
