import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DiscoveryFilter {
  maxDistance: number; // km
  minAge: number;
  maxAge: number;
  gender: 'MALE' | 'FEMALE' | 'BOTH';
  verifiedOnly: boolean;
}

export const defaultFilter: DiscoveryFilter = {
  maxDistance: 100,
  minAge: 18,
  maxAge: 60,
  gender: 'BOTH',
  verifiedOnly: false,
};

/** True when the filter differs from the defaults (i.e. actively narrowing). */
export function isFilterActive(f: DiscoveryFilter): boolean {
  return (
    f.maxDistance !== defaultFilter.maxDistance ||
    f.minAge !== defaultFilter.minAge ||
    f.maxAge !== defaultFilter.maxAge ||
    f.gender !== defaultFilter.gender ||
    f.verifiedOnly
  );
}

interface FilterValue {
  filter: DiscoveryFilter;
  active: boolean;
  setFilter: (f: DiscoveryFilter) => void;
  reset: () => void;
}

const FilterContext = createContext<FilterValue | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilterState] = useState<DiscoveryFilter>(defaultFilter);
  const setFilter = useCallback((f: DiscoveryFilter) => setFilterState(f), []);
  const reset = useCallback(() => setFilterState(defaultFilter), []);
  return (
    <FilterContext.Provider value={{ filter, active: isFilterActive(filter), setFilter, reset }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used within FilterProvider');
  return ctx;
}
