import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = (global as any).prismaOverride || (globalThis.prismaGlobal ?? prismaClientSingleton())

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
