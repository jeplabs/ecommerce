import type { OrderApi } from '@/entities/order/model/schemas/api';
import type { SpringPage } from '@/shared/api/spring-page';

export function mockOrdersPage(content: OrderApi[] = []): SpringPage<OrderApi> {
    return {
        content,
        totalElements: content.length,
        totalPages: content.length === 0 ? 0 : 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: content.length === 0,
        numberOfElements: content.length,
    };
}
