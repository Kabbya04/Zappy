// /lib/rawg.ts

interface RAWGGameAPI {
  name: string;
  released?: string;
  background_image?: string;
  rating?: number;
  playtime?: number;
  genres?: { name: string }[];
}

/**
 * MODIFICATION: Fetches the latest and most popular games from RAWG.
 * This function no longer takes a query.
 */
export async function getLatestGames(): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
  if (!apiKey) {
    console.error("RAWG API key is missing.");
    return null;
  }

  try {
    // Order by release date to get the newest games, and get the top 40 to ensure we have enough after filtering
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${apiKey}&ordering=-released&page_size=40`
    );

    if (!response.ok) {
      console.error("Failed to fetch latest games from RAWG:", response.statusText);
      return null;
    }

    const jsonResponse = await response.json();
    const games = jsonResponse.results;

    if (!games || games.length === 0) {
      return null;
    }

    // MODIFICATION: Filter out games with a future release date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const releasedGames = games.filter((game: RAWGGameAPI) => {
        if (!game.released) return false;
        const releaseDate = new Date(game.released);
        return releaseDate <= today;
    }).slice(0, 20); // Take the top 20 of the *released* games

    const gameContext = releasedGames
      .map((game: RAWGGameAPI) => 
        `- Title: ${game.name} (Released: ${game.released || 'N/A'}, Rating: ${game.rating || 'N/A'}, Genres: ${game.genres?.map(g => g.name).join(', ') || 'N/A'})`
      )
      .join('\n');

    return gameContext;
  } catch (error) {
    console.error("Error fetching latest games from RAWG:", error);
    return null;
  }
}

/**
 * Fetches the image for a single game from the RAWG API.
 */
export async function getRawgImage(query: string): Promise<string | null> {
    const apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
    if (!apiKey) {
      console.error("RAWG API key is missing.");
      return null;
    }
    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=1`
      );
      if (!response.ok) {
        console.error(`RAWG image search failed for "${query}" with status: ${response.statusText}`);
        return null;
      }
      const jsonResponse = await response.json();
      const game = jsonResponse.results?.[0];
      return game?.background_image || null;
    } catch (error) {
      console.error(`Error fetching RAWG image for "${query}":`, error);
      return null;
    }
}
