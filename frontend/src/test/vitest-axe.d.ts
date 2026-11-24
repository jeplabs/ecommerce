import 'vitest';
import type { Result } from 'axe-core';

interface NoViolationsMatcherResult {
    message(): string;
    pass: boolean;
    actual: Result[];
}

interface AxeMatchers {
    toHaveNoViolations(): NoViolationsMatcherResult;
}

declare module 'vitest' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
    interface Assertion<T = any> extends AxeMatchers {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface AsymmetricMatchersContaining extends AxeMatchers {}
}
