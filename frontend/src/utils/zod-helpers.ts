import { z } from 'zod';

/** BigDecimal / number desde JSON del backend Spring. */
export const moneySchema = z.coerce.number();

export const positiveIntSchema = z.number().int().positive();

/** LocalDateTime serializado como string ISO por Jackson. */
export const localDateTimeSchema = z.string();

export const nullableStringSchema = z.string().nullable().optional();
