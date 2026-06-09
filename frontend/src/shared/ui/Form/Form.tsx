import clsx from 'clsx';
import type { FormHTMLAttributes } from 'react';
import styles from './Form.module.css';

export type FormVariant = 'default' | 'auth' | 'wide';

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
    variant?: FormVariant;
};

export function Form({ variant = 'default', className, ...rest }: FormProps) {
    return (
        <form
            className={clsx(
                styles.form,
                variant === 'auth' && styles.auth,
                variant === 'wide' && styles.wide,
                className
            )}
            {...rest}
        />
    );
}

export default Form;
