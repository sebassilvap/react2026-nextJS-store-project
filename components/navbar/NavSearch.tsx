'use client';
import { Input } from '../ui/input';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useEffect } from 'react';

const NavSearch = () => {
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    // construct statevalue
    const [search, setSearch] = useState(searchParams.get('search')?.toString() || '');

    // useDebouncedCallback => just to invoke a function with a delay
    const handleSearch = useDebouncedCallback((value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        replace(`/products?${params.toString()}`);
    }, 500);

    // state value empty if no value search params
    useEffect(() => {
        if (!searchParams.get('search')) {
            setSearch('');
        }
    }, [searchParams.get('search')]);

    return (
        <Input
            type='search'
            placeholder='search product...'
            className='max-w-xs dark:bg-muted'
            onChange={(e) => {
                setSearch(e.target.value);
                handleSearch(e.target.value);
            }}
            value={search}
        />
    );
};
export default NavSearch;
