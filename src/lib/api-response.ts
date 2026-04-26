import { NextResponse } from 'next/server';

export type APIResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

/**
 * Utility to create standardized JSON responses for Next.js API routes.
 */
export const createResponse = <T>(
    data: T | null = null,
    error: string | null = null,
    status: number = 200
) => {
    const body: APIResponse<T> = {
        success: !error,
        ...(data !== null ? { data } : {}),
        ...(error !== null ? { error } : {}),
    };

    return NextResponse.json(body, { status });
};
