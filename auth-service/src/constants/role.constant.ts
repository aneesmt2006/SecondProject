export const USER_ROLES = {
    ADMIN:'admin',
    USER:'user'
} as const ;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES] // become like UserRole = 'admin' | 'user'