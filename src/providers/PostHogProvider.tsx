'use client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import React, { useEffect } from 'react';

export function PHProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        const isRealKey = key && key.startsWith('phc_') && !key.includes('INSERT_YOUR_KEY');
        if (typeof window !== 'undefined' && isRealKey) {
            posthog.init(key, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
                capture_pageview: false, // Disable automatic pageview capture, as we capture manually
            });
        }
    }, []);

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
