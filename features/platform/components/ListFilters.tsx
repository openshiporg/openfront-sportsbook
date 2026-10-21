'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type ListFilterOption = { label: string; value: string };
export type ListFilter = { key: string; label: string; options: ListFilterOption[]; allLabel?: string };

/**
 * URL-state search and allowlisted filters for a platform list. Changing either
 * resets to page 1; the server screen reads the same params and queries GraphQL,
 * so back/forward and shared links reproduce the exact list.
 */
export function ListFilters({ searchKey = "q", searchLabel, searchPlaceholder, filters = [] }: { searchKey?: string; searchLabel?: string; searchPlaceholder?: string; filters?: ListFilter[] }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const current = searchParams?.get(searchKey) ?? "";
  const [text, setText] = useState(current);
  useEffect(() => setText(current), [current]);

  const navigate = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return <div className="flex flex-wrap items-end gap-2">
    {searchLabel ? <form role="search" className="relative min-w-56 flex-1" onSubmit={(event) => { event.preventDefault(); navigate({ [searchKey]: text.trim() || null }); }}>
      <label className="sr-only" htmlFor={`list-search-${searchKey}`}>{searchLabel}</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input id={`list-search-${searchKey}`} type="search" value={text} onChange={(event) => setText(event.target.value)} placeholder={searchPlaceholder ?? searchLabel} className="h-9 pl-9" />
    </form> : null}
    {filters.map((filter) => <label key={filter.key} className="grid gap-1 text-xs font-medium text-muted-foreground">
      {filter.label}
      <select value={searchParams?.get(filter.key) ?? ""} onChange={(event) => navigate({ [filter.key]: event.target.value || null })} className="h-9 rounded-md border bg-background px-2 text-sm text-foreground">
        <option value="">{filter.allLabel ?? "All"}</option>
        {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>)}
  </div>;
}
