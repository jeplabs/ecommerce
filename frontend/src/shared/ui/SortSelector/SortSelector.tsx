import type { ChangeEvent } from 'react';
import type { CatalogSortOrder } from '@/features/catalog/model/types';
import styles from './SortSelector.module.css';

type SortSelectorProps = {
    sortOption: CatalogSortOrder | '';
    onChange: (value: CatalogSortOrder | '') => void;
};

export const SortSelector = ({ sortOption, onChange }: SortSelectorProps) => {
    const SORT_OPTIONS: { value: CatalogSortOrder; label: string }[] = [
        { value: 'price-asc', label: 'Precio: menor a mayor' },
        { value: 'price-desc', label: 'Precio: mayor a menor' },
        { value: 'name-asc', label: 'Nombre: A-Z' },
        { value: 'name-desc', label: 'Nombre: Z-A' },
        { value: 'newest', label: 'Más reciente' },
    ];

    return (
        <div className={styles.container}>
            <label htmlFor="sort-products" className={styles.label}>
                Ordenar por:
            </label>
            <select
                id="sort-products"
                value={sortOption}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    onChange(e.target.value as CatalogSortOrder | '')
                }
                className={styles.select}
            >
                <option value="">Selecciona una opción</option>
                {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
