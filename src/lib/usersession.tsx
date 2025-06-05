import type { Role } from '@prisma/client'

export type UserSession = {
    email: string
    role: Role,
    name: string,
    startcountry: string
}

