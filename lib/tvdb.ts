// /lib/tvdb.ts

// A simple in-memory cache for the API token
let tokenCache = {
  token: null as string | null,
  expires: 0,
};

interface TVDBTitle {
  id: number;
  name: string;
  slug: string;
  year: string;
  overview: string;
  genres?: (string | { name: string })[];
  image_url?: string;
  type?: string;
}

interface TVDBSearchResponse {
  data: TVDBTitle[];
}

/**
 * Authenticates with TheTVDB API and retrieves a JWT.
 */
async function getTVDBToken(): Promise<string | null> {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expires > now) {
    return tokenCache.token;
  }

  const apiKey = process.env.NEXT_PUBLIC_THETVDB_API_KEY;
  if (!apiKey) {
    console.error("TheTVDB API key is missing.");
    return null;
  }

  try {
    const response = await fetch("https://api4.thetvdb.com/v4/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey: apiKey }),
    });

    if (!response.ok) {
      console.error("Failed to authenticate with TheTVDB API:", response.statusText);
      return null;
    }

    const jsonResponse = await response.json();
    const token = jsonResponse.data.token;
    tokenCache = { token, expires: now + 24 * 60 * 60 * 1000 };
    return token;
  } catch (error) {
    console.error("Error authenticating with TheTVDB:", error);
    return null;
  }
}

/**
 * Searches TheTVDB for recent releases to use as initial LLM context.
 */
export async function getRecentReleases(query: string, type: 'series' | 'movie'): Promise<string | null> {
  const token = await getTVDBToken();
  if (!token) return null;

  const cutoffYear = 2023;

  try {
    const response = await fetch(`https://api4.thetvdb.com/v4/search?query=${encodeURIComponent(query)}&type=${type}&limit=10`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const jsonResponse = await response.json();
    const allResults = jsonResponse.data;

    if (!allResults || allResults.length === 0) return null;

    const recentResults = allResults
      .filter((item: TVDBTitle) => item.year && parseInt(item.year) >= cutoffYear)
      .map((item: TVDBTitle) => `- "${item.name}" (${item.year}): ${item.overview}`)
      .join('\n');
      
    return recentResults.length > 0 ? recentResults : null;

  } catch (error) {
    console.error(`Error fetching recent releases from TheTVDB:`, error);
    return null;
  }
}

/**
 * Searches TVDB for a specific title and returns a detailed summary for conversational context.
 */
export async function getConversationalContext(query: string): Promise<string | null> {
  const token = await getTVDBToken();
  if (!token) return null;

  try {
    const response = await fetch(`https://api4.thetvdb.com/v4/search?query=${encodeURIComponent(query)}&limit=3`, {
        headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const jsonResponse: TVDBSearchResponse = await response.json();
    const results = jsonResponse.data;

    if (!results || results.length === 0) return null;

    const context = results
        .map((item: TVDBTitle) => `Title: ${item.name}\nYear: ${item.year}\nType: ${item.type}\nOverview: ${item.overview}`)
        .join('\n\n');

    return context;
  } catch (error) {
    console.error(`Error fetching conversational context for "${query}":`, error);
    return null;
  }
}

/**
 * Helper function to check if an entry has anime/animation genres.
 * Handles both string arrays and object arrays with 'name' property.
 */
function hasAnimeGenre(item: TVDBTitle): boolean {
  if (!item.genres || !Array.isArray(item.genres)) return false;
  
  const animeKeywords = ['anime', 'animation', 'animated'];
  
  return item.genres.some((genre) => {
    // Handle if genre is an object with 'name' property
    if (typeof genre === 'object' && genre.name) {
      return animeKeywords.some(keyword => 
        genre.name.toLowerCase().includes(keyword)
      );
    }
    // Handle if genre is a plain string
    if (typeof genre === 'string') {
      return animeKeywords.some(keyword => 
        genre.toLowerCase().includes(keyword)
      );
    }
    return false;
  });
}

/**
 * IMPROVED: Robust anime thumbnail fetching with genre validation and smart fallbacks.
 * 
 * For Anime category:
 * 1. Fetches top 5 search results
 * 2. Prioritizes entries with "Anime" or "Animation" in their genres
 * 3. Falls back intelligently if no genre match is found
 * 
 * For other categories:
 * - Uses the top-ranked result from TVDB
 */
export async function getTVDBImage(query: string, type: 'series' | 'movie', category: string): Promise<string | null> {
  const token = await getTVDBToken();
  if (!token) return null;

  try {
    // Step 1: Perform search with limit of 5 for top results
    const searchLimit = 5;
    console.log(`Searching TVDB for "${query}" (category: ${category}, type: ${type}) with limit ${searchLimit}...`);
    
    const response = await fetch(
      `https://api4.thetvdb.com/v4/search?query=${encodeURIComponent(query)}&type=${type}&limit=${searchLimit}`, 
      {
        headers: { "Authorization": `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      console.error(`TVDB search failed with status ${response.status}`);
      return null;
    }

    const jsonResponse = await response.json();
    const candidates = jsonResponse.data || [];

    if (candidates.length === 0) {
      console.warn(`No results found for query: "${query}"`);
      return null;
    }

    console.log(`Found ${candidates.length} candidates for "${query}"`);

    // Step 2: For Anime category, perform strict genre validation
    if (category === 'Anime') {
      console.log(`Processing Anime category - validating genres for ${candidates.length} candidates...`);
      
      // Log all candidates with their genres for debugging
      candidates.forEach((item: TVDBTitle, index: number) => {
        console.log(`  [${index + 1}] "${item.name}" (${item.year || 'N/A'}) - Genres: ${JSON.stringify(item.genres || 'None')}`);
      });
      
      // Step 3: Find first candidate with anime/animation genre
      const animeMatch = candidates.find((item: TVDBTitle) => hasAnimeGenre(item));
      
      if (animeMatch) {
        console.log(`✓ SUCCESS: Found anime genre match -> "${animeMatch.name}" (${animeMatch.year || 'N/A'})`);
        return animeMatch.image_url || null;
      }
      
      // Step 4: Smart fallback for anime - skip live-action adaptations
      console.warn(`⚠ No anime genre found in top ${searchLimit} results for "${query}"`);
      console.log(`Applying smart fallback: checking for non-live-action entries...`);
      
      // Try to avoid entries that explicitly mention "live action" or have recent years (likely live adaptations)
      const likelyAnimeEntry = candidates.find((item: TVDBTitle) => {
        const name = (item.name || '').toLowerCase();
        const overview = (item.overview || '').toLowerCase();
        const isLiveAction = name.includes('live action') || overview.includes('live action') || overview.includes('live-action');
        
        // If it's explicitly live action, skip it
        if (isLiveAction) {
          console.log(`  Skipping "${item.name}" - detected as live action`);
          return false;
        }
        
        return true;
      });
      
      if (likelyAnimeEntry) {
        console.log(`✓ Fallback applied: Using "${likelyAnimeEntry.name}" (avoided live-action entries)`);
        return likelyAnimeEntry.image_url || null;
      }
      
      // Ultimate fallback - use first result but log warning
      console.warn(`⚠ Ultimate fallback: Using first result "${candidates[0].name}"`);
      return candidates[0]?.image_url || null;
    }
    
    // Step 5: For non-anime categories (Movie, TV Series), use top result
    console.log(`Using top-ranked result for ${category}: "${candidates[0].name}"`);
    return candidates[0]?.image_url || null;

  } catch (error) {
    console.error(`Error fetching image for "${query}":`, error);
    return null;
  }
}