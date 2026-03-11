'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useSearchParam(key: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(key) ?? '';

  const setValue = useCallback(
    (val: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) params.set(key, val);
      else params.delete(key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [key, pathname, router, searchParams],
  );

  return [value, setValue] as const;
}
