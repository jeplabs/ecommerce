import { useState, useEffect, SyntheticEvent, ImgHTMLAttributes } from 'react';
import { PRODUCT_PLACEHOLDER_IMAGE, resolveProductImageUrl } from '@/shared/assets/product-placeholder';

export type ProductImageProps = ImgHTMLAttributes<HTMLImageElement> & {
    fallbackSrc?: string;
};

export function ProductImage({
    src,
    alt = '',
    fallbackSrc = PRODUCT_PLACEHOLDER_IMAGE,
    onError,
    ...props
}: ProductImageProps) {
    const resolvedSrc = resolveProductImageUrl(src);
    const [imgSrc, setImgSrc] = useState<string>(resolvedSrc);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        setImgSrc(resolveProductImageUrl(src));
        setHasError(false);
    }, [src]);

    const handleError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
        }
        if (onError) {
            onError(e);
        }
    };

    return (
        <img
            {...props}
            src={imgSrc}
            alt={alt}
            onError={handleError}
        />
    );
}

export default ProductImage;

