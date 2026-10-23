import { searchLocalFoods, cacheExternalFood } from '../database/repositories/foodRepo';
import { searchUSDA } from './usdaApi';
import { searchOpenFoodFacts } from './openFoodFactsApi';
import { FoodItem } from '../types/nutrition';

export interface MultiSourceSearchResult {
  items: FoodItem[];
  isOffline: boolean;
  searchedExternal: boolean;
}

/**
 * Searches local bundled/custom foods first, and complements with USDA & Open Food Facts
 * when online. Automatically caches remote results into local SQLite for offline access.
 */
export async function searchFoodCatalog(
  query: string,
  options: { includeExternal?: boolean } = { includeExternal: true }
): Promise<MultiSourceSearchResult> {
  const trimmed = query.trim();

  // Step 1: Always search local SQLite database first
  const localResults = await searchLocalFoods(trimmed, 40);

  if (!trimmed || !options.includeExternal) {
    return {
      items: localResults,
      isOffline: false,
      searchedExternal: false,
    };
  }

  // Step 2: Query external APIs in parallel with error boundaries
  let usdaResults: FoodItem[] = [];
  let offResults: FoodItem[] = [];
  let isOffline = false;

  try {
    const [usda, off] = await Promise.allSettled([
      searchUSDA(trimmed, 12),
      searchOpenFoodFacts(trimmed, 12),
    ]);

    if (usda.status === 'fulfilled') {
      usdaResults = usda.value;
    }
    if (off.status === 'fulfilled') {
      offResults = off.value;
    }

    if (
      (usda.status === 'rejected' || usdaResults.length === 0) &&
      (off.status === 'rejected' || offResults.length === 0)
    ) {
      // Could be offline or query yielded no external matches
    }
  } catch (err) {
    isOffline = true;
  }

  // Deduplicate and combine (Local items take priority)
  const seenIds = new Set<string>(localResults.map((item) => item.id));
  const seenNames = new Set<string>(localResults.map((item) => item.name.toLowerCase()));

  const combined: FoodItem[] = [...localResults];

  const externalCandidates = [...usdaResults, ...offResults];
  for (const item of externalCandidates) {
    const normalizedName = item.name.toLowerCase().trim();
    if (!seenIds.has(item.id) && !seenNames.has(normalizedName)) {
      seenIds.add(item.id);
      seenNames.add(normalizedName);
      combined.push(item);

      // Cache external item locally in background
      cacheExternalFood(item).catch(() => {});
    }
  }

  return {
    items: combined,
    isOffline,
    searchedExternal: true,
  };
}
