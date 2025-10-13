// /lib/tvdb.ts

// A simple in-memory cache for the API token
let tokenCache = {
  token: null as string | null,
  expires: 0,
};

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
      .filter((item: any) => item.year && parseInt(item.year) >= cutoffYear)
      .map((item: any) => `- "${item.name}" (${item.year}): ${item.overview}`)
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

    const jsonResponse = await response.json();
    const results = jsonResponse.data;

    if (!results || results.length === 0) return null;

    const context = results
        .map((item: any) => `Title: ${item.name}\nYear: ${item.year}\nType: ${item.type}\nOverview: ${item.overview}`)
        .join('\n\n');

    return context;
  } catch (error) {
    console.error(`Error fetching conversational context for "${query}":`, error);
    return null;
  }
}


/**
 * MODIFICATION: Implemented a resilient two-step search for images.
 * It first tries a specific "smart search" and then a broad "fallback search".
 */
export async function getTVDBImage(query: string, type: 'series' | 'movie', category: string): Promise<string | null> {
  const token = await getTVDBToken();
  if (!token) return null;

  try {
    // --- Attempt 1: Smart Search (Title + Category) ---
    // This is best for ambiguous titles to get the right media type (e.g., "Perfect Blue anime").
    const smartSearchQuery = (category === 'Anime' || category === 'Movie') 
        ? `${query} ${category}` 
        : query;

    console.log(`Attempting smart search for image with query: "${smartSearchQuery}"`);
    const smartResponse = await fetch(`https://api4.thetvdb.com/v4/search?query=${encodeURIComponent(smartSearchQuery)}&type=${type}&limit=1`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (smartResponse.ok) {
      const jsonResponse = await smartResponse.json();
      const imageUrl = jsonResponse.data?.[0]?.image_url;
      if (imageUrl) {
        console.log("Smart search successful.");
        return imageUrl; // Success! Return the image URL.
      }
    }

    // --- Attempt 2: Fallback Search (Title Only) ---
    // If smart search fails, it might be a complex title. We try again with just the title.
    console.log(`Smart search failed. Attempting fallback with just the title: "${query}"`);
    const fallbackResponse = await fetch(`https://api4.thetvdb.com/v4/search?query=${encodeURIComponent(query)}&type=${type}&limit=1`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (fallbackResponse.ok) {
      const jsonResponse = await fallbackResponse.json();
      const imageUrl = jsonResponse.data?.[0]?.image_url;
      if (imageUrl) {
        console.log("Fallback search successful.");
        return imageUrl; // Success on the fallback!
      }
    }
    
    // If both attempts fail, we log it and return null.
    console.warn(`Both smart and fallback searches failed for title: "${query}"`);
    return null;

  } catch (error) {
    console.error(`An error occurred during image search for "${query}":`, error);
    return null;
  }
}