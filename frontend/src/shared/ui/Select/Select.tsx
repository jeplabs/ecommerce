import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import controlStyles from '../Input/control.module.css';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { invalid = false, className, children, ...rest },
    ref
) {
    return (
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
    );
});

export default Select;
