import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import controlStyles from './control.module.css';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    invalid?: boolean;
    withIconPadding?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { invalid = false, withIconPadding = false, className, ...rest },
    ref
) {
    return (
        <input
            ref={ref}
            className={clsx(
                controlStyles.control,
                invalid && controlStyles.invalid,
                withIconPadding && controlStyles.withIconPadding,
                className
            )}
            aria-invalid={invalid || undefined}
            {...rest}
        />
    );
});

export default Input;
