"use server";

// Server action dla globalnego searcha.

import { searchAll, type SearchResult } from "@/lib/queries/search";

export async function searchAction(query: string): Promise<SearchResult[]> {
  return searchAll(query);
}
