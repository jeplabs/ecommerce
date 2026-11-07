import type {
    UserApi,
    UpdatePasswordFormValues,
    UpdateProfileFormValues,
} from '@/entities/user';

export type {
    UserApi,
    UpdatePasswordFormValues,
    UpdateProfileFormValues,
};

export type UpdateProfileRequest = UpdateProfileFormValues;

export type ProfileActionResult<T = UserApi> =
    | { success: true; data: T }
    | { success: false; error: string };

