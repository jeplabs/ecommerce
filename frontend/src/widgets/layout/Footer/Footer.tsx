import { Button } from '@/shared/ui/Button';
import styles from './Footer.module.css';

type IconProps = {
    size?: number;
    color?: string;
};

const IconFacebook = ({ size = 24, color = 'currentColor' }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const IconInstagram = ({ size = 24, color = 'currentColor' }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const IconTwitter = ({ size = 24, color = 'currentColor' }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
);

const IconMail = ({ size = 20 }: Pick<IconProps, 'size'>) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const IconPhone = ({ size = 20 }: Pick<IconProps, 'size'>) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const IconTruck = ({ size = 28 }: Pick<IconProps, 'size'>) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect width="16" height="13" x="1" y="3" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);

const IconShield = ({ size = 28 }: Pick<IconProps, 'size'>) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const IconPackage = ({ size = 28 }: Pick<IconProps, 'size'>) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
    </svg>
);

const IconCreditCard = ({ size = 28 }: Pick<IconProps, 'size'>) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
);

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.col}>
                        <h2 className={styles.logo}>
                            JEPLabs Ecommerce<span className={styles.accent}>.</span>
                        </h2>
                        <p className={styles.desc}>
                            Ecommerce moderno diseñado con estándares de calidad. Envíos rápidos y
                            atención personalizada.
                        </p>
                        <div className={styles.socialRow}>
                            <a href="#" className={styles.socialBtn}>
                                <IconFacebook />
                            </a>
                            <a href="#" className={styles.socialBtn}>
                                <IconInstagram />
                            </a>
                            <a href="#" className={styles.socialBtn}>
                                <IconTwitter />
                            </a>
                        </div>
                    </div>

                    <div className={styles.col}>
                        <h4 className={styles.heading}>Tienda</h4>
                        <ul className={styles.list}>
                            <li>
                                <a href="#">Novedades</a>
                            </li>
                            <li>
                                <a href="#">Más Vendidos</a>
                            </li>
                            <li>
                                <a href="#">Ofertas</a>
                            </li>
                            <li>
                                <a href="#">Gift Cards</a>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.col}>
                        <h4 className={styles.heading}>Ayuda</h4>
                        <ul className={styles.list}>
                            <li>
                                <a href="#">Rastrear Pedido</a>
                            </li>
                            <li>
                                <a href="#">Devoluciones</a>
                            </li>
                            <li>
                                <a href="#">FAQ</a>
                            </li>
                            <li>
                                <a href="#">Contacto</a>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.col}>
                        <h4 className={styles.heading}>Newsletter</h4>
                        <p className={styles.small}>Recibe un 10% OFF en tu primera compra.</p>
                        <form className={styles.inputGroup} onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Tu email"
                                className={styles.input}
                                required
                            />
                            <Button type="submit" variant="primary">
                                Unirme al Newsletter
                            </Button>
                        </form>
                        <div className={styles.contactRow}>
                            <span className={styles.iconText}>
                                <IconMail size={16} /> contacto@jeplabsecommerce.com
                            </span>
                            <span className={styles.iconText}>
                                <IconPhone size={16} /> +34 900 000
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.featuresBar}>
                    <div className={styles.feature}>
                        <div className={styles.featureIconWrap}>
                            <IconTruck />
                        </div>
                        <span>Envío Gratis</span>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.featureIconWrap}>
                            <IconShield />
                        </div>
                        <span>Pago Seguro</span>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.featureIconWrap}>
                            <IconPackage />
                        </div>
                        <span>Devolución 30 días</span>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.featureIconWrap}>
                            <IconCreditCard />
                        </div>
                        <span>Tarjetas</span>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; 2026 JEPLabs Ecommerce. Todos los derechos reservados.</p>
                    <div className={styles.payments}>
                        <span className={styles.payTag}>VISA</span>
                        <span className={styles.payTag}>Mastercard</span>
                        <span className={styles.payTag}>PayPal</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
