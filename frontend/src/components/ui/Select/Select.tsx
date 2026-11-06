import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import controlStyles from '../Input/control.module.css';
import styles from './Select.module.css';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { invalid = false, className, children, ...rest },
    ref
) {
    return (
        <div className={styles.wrapper}>
            <select
                ref={ref}
                className={clsx(
                    controlStyles.control,
                    invalid && controlStyles.invalid,
                    className
                )}
                aria-invalid={invalid || undefined}
                {...rest}
            >
                {children}
            </select>
            <span className={styles.chevron} aria-hidden="true" />
        </div>
    );
});

export default Select;
