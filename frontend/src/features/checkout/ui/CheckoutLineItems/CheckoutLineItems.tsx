import type { CartItemUiView } from '@/entities/cart';
import { formatCurrency } from '@/shared/lib/format';
import styles from './CheckoutLineItems.module.css';

type CheckoutLineItemsProps = {
    items: CartItemUiView[];
};

/** Lista de ítems del carrito para revisión en el paso 1 del checkout. */
export default function CheckoutLineItems({ items }: CheckoutLineItemsProps) {
    return (
        <section className={styles.root} aria-labelledby="checkout-line-items-title">
            <h2 id="checkout-line-items-title" className={styles.title}>
                Tu pedido
            </h2>
            <p className={styles.subtitle}>
                Revisa los productos antes de elegir entrega y pago.
            </p>
            <ul className={styles.list}>
                {items.map((item) => (
                    <li key={item.id} className={styles.item}>
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt=""
                                className={styles.thumb}
                            />
                        ) : (
                            <div className={styles.thumbPlaceholder} aria-hidden="true" />
                        )}
                        <div className={styles.info}>
                            <span className={styles.name}>{item.name || 'Producto'}</span>
                            <span className={styles.meta}>
                                Cant. {item.quantity}
                                {item.sku ? ` · SKU ${item.sku}` : ''}
                            </span>
                        </div>
                        <span className={styles.price}>
                            {formatCurrency(item.subtotal ?? item.price * item.quantity)}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
