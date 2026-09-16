import React from 'react';
import { TableTheme } from '../types';

export interface SearchBarProps {
    showSearch: boolean;
    setShowSearch: (v: boolean) => void;
    searchValue: string;
    setSearchValue: (v: string) => void;
    theme?: TableTheme;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    searchValue,
    setSearchValue,
    theme = {},
}) => (
    <label className="relative block">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
        </span>
        <input
            className={`h-9 w-full max-w-sm min-w-[16rem] rounded-full border pl-9 pr-3 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 ${theme.input || 'bg-white text-slate-900 border-slate-200'}`}
            type="search"
            placeholder={theme.inputPlaceholder || 'Search records…'}
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
        />
    </label>
);
