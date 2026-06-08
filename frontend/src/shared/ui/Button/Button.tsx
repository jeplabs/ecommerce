import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'danger'
    | 'outlinePrimary'
    | 'outlineDanger';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        variant = 'primary',
        fullWidth = false,
        className,
        type = 'button',
        children,
        ...rest
    },
    ref
) {
    return (
        <button
            ref={ref}
            type={type}
            className={clsx(
                styles.button,
                styles[variant],
                fullWidth && styles.fullWidth,
                className
            )}
            {...rest}
        >
            {children}
        </button>
    );
});

export default Button;
