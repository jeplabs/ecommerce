import type { UserApi, UserRole } from '@/entities/user/model/schemas/api';
import { mockAdminUser, mockUserProfile } from './auth';

let users: UserApi[] = [];

export function resetDynamicUsers() {
    users = [mockUserProfile, mockAdminUser].map((user) => ({ ...user }));
}

export function getDynamicUsers(): UserApi[] {
    return users.map((user) => ({ ...user }));
}

export function findDynamicUser(id: number): UserApi | undefined {
    const user = users.find((entry) => entry.id === id);
    return user ? { ...user } : undefined;
}

export function updateDynamicUserRol(id: number, rol: UserRole): UserApi {
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) {
        throw new Error('Usuario no encontrado');
    }

    users[index] = { ...users[index]!, rol };
    return { ...users[index]! };
}

export function updateDynamicUserEstado(id: number, activo: boolean): UserApi {
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) {
        throw new Error('Usuario no encontrado');
    }

    users[index] = { ...users[index]!, activo };
    return { ...users[index]! };
}

resetDynamicUsers();
