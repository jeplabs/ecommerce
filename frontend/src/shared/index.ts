export {
    createSpringPageSchema,
    normalizeSpringPageRaw,
    type SpringPage,
} from './api/spring-page';
export { parseApi, safeParseApi } from './api/parse-api';
export { ApiError, getErrorMessage } from './api/api-error';
export {
    moneySchema,
    positiveIntSchema,
    localDateTimeSchema,
    nullableStringSchema,
} from './lib/zod-helpers';

export { default as useClickOutside } from './lib/useClickOutside';

export {
    formatCurrency,
    formatDateTime,
    getInitials,
    formatEstadoOrden,
} from './lib/format';
export { getJwtExpiryMs } from './lib/jwt-expiry';
export {
    getAuthHeaders,
    parseListResponse,
    isAuthError,
    notifyUnauthorizedIfNeeded,
    redirectUnauthorized,
} from './lib/http-session';
