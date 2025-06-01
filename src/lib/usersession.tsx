import type { Role } from '@prisma/client'

export type UserSession = {
    id: number
    email: string
    role: Role,
    name: string,
    iat: number,
    exp: number,
}

