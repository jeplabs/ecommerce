import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './FormField.module.css';

export type FormFieldProps = {
    label?: string;
    htmlFor?: string;
    error?: string | null;
    hint?: string;
    readonly?: boolean;
    className?: string;
    children: ReactNode;
};

export function FormField({
    label,
    htmlFor,
    error,
    hint,
    readonly = false,
    className,
    children,
}: FormFieldProps) {
    return (
        <div className={clsx(styles.field, readonly && styles.readonly, className)}>
            {label && (
                <label className={styles.label} htmlFor={htmlFor}>
                    {label}
                </label>
            )}
            {children}
            {error && (
                <span className={styles.error} role="alert" data-field-error>
                    {error}
                </span>
            )}
            {hint && !error && <span className={styles.hint}>{hint}</span>}
        </div>
    );
}

export function FieldError({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span className={clsx(styles.error, className)} role="alert" data-field-error>
            {children}
        </span>
    );
}

export default FormField;
