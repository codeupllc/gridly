import React from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 2.5rem;
  min-width: 2.7rem;
`;

const SearchIconButton = styled.button`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  margin-right: 0.5rem;

  &:hover {
    box-shadow: 0 2px 8px rgba(37,99,235,0.10);
    border-color: #2563eb;
  }
`;

const SearchInput = styled.input<{ expanded: boolean }>`
  width: ${({ expanded }) => (expanded ? '16rem' : '0')};
  opacity: ${({ expanded }) => (expanded ? 1 : 0)};
  padding: ${({ expanded }) => (expanded ? '0.5rem 1rem' : '0')};
  border: 1px solid #e5e7eb;
  border-radius: 1.25rem;
  background: #fff;
  color: #222;
  font-size: 1rem;
  transition: width 0.3s, opacity 0.3s, padding 0.3s;
  margin-left: ${({ expanded }) => (expanded ? '0' : '-2rem')};
  pointer-events: ${({ expanded }) => (expanded ? 'auto' : 'none')};
  outline: none;
`;

export interface SearchBarProps {
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ showSearch, setShowSearch, searchValue, setSearchValue }) => (
  <SearchContainer>
    <SearchIconButton onClick={() => setShowSearch(!showSearch)} aria-label="Show search" type="button">
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
    </SearchIconButton>
    <SearchInput
      expanded={showSearch}
      type="search"
      placeholder="Search…"
      value={searchValue}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
      autoFocus={showSearch}
      onBlur={() => setShowSearch(false)}
    />
  </SearchContainer>
);