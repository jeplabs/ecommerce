import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import controlStyles from '../Input/control.module.css';
import styles from './Textarea.module.css';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { invalid = false, className, ...rest },
    ref
) {
    return (
        <textarea
            ref={ref}
            className={clsx(styles.textarea, invalid && controlStyles.invalid, className)}
            aria-invalid={invalid || undefined}
            {...rest}
        />
    );
});

export default Textarea;
