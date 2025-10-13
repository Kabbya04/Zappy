export const initialQuestion = {
  id: 1,
  text: "First, what are you in the mood for?",
  // Add "TV Series" to the options array
  options: ["Game", "Anime", "Movie", "TV Series"],
};

export const questionSets = {
  Game: [
    {
      id: 2,
      text: "Which genre are you looking for in a game?",
      options: ["RPG", "Action-Adventure", "Strategy", "Shooter", "Indie", "Puzzle"],
    },
    {
      id: 3,
      text: "What kind of gameplay experience do you prefer?",
      options: ["A deep, story-driven campaign", "Fast-paced, competitive multiplayer", "Relaxing and creative sandbox", "Challenging strategic thinking"],
    },
    {
      id: 4,
      text: "Which art style appeals to you most?",
      options: ["Hyper-Realistic", "Stylized Cel-Shading", "Pixel Art", "Minimalist"],
    },
    {
      id: 5,
      text: "What is your preferred player format?",
      options: ["Single-Player", "Co-op with friends", "Massively Multiplayer (MMO)", "Doesn't matter"],
    },
  ],
  Anime: [
    {
      id: 2,
      text: "Which anime genre are you interested in?",
      options: ["Shonen (Action/Adventure)", "Slice of Life", "Isekai (Another World)", "Psychological Thriller", "Romance", "Mecha"],
    },
    {
      id: 3,
      text: "What kind of story length do you prefer?",
      options: ["A short series (12-24 episodes)", "A long-running epic (100+ episodes)", "A standalone movie", "Doesn't matter"],
    },
    {
      id: 4,
      text: "What visual style do you enjoy?",
      options: ["Classic 90s aesthetic", "Modern & crisp animation", "Unique & experimental art", "Visually stunning (e.g., Ufotable/Makoto Shinkai)"],
    },
    {
      id: 5,
      text: "What's the primary mood you're seeking?",
      options: ["Lighthearted and funny", "Dark and thought-provoking", "Epic and inspiring", "Heartwarming and emotional"],
    },
  ],
  Movie: [
    {
      id: 2,
      text: "Which movie genre are you in the mood for?",
      options: ["Sci-Fi", "Fantasy", "Thriller", "Comedy", "Drama", "Action"],
    },
    {
      id: 3,
      text: "What kind of film are you looking for?",
      options: ["A blockbuster with amazing effects", "An indie film with a strong story", "A critically-acclaimed classic", "A lighthearted popcorn flick"],
    },
    {
      id: 4,
      text: "What's more important to you?",
      options: ["A complex, mind-bending plot", "Strong character development", "Breathtaking cinematography", "Non-stop action"],
    },
    {
      id: 5,
      text: "Pick a decade for the film's release:",
      options: ["2020s", "2010s", "2000s", "90s or earlier"],
    },
  ],
  // Add the new question set for TV Series
  "TV Series": [
    {
      id: 2,
      text: "Which TV series genre are you in the mood for?",
      options: ["Comedy", "Drama", "Sci-Fi/Fantasy", "Thriller/Mystery", "Documentary", "Reality TV"],
    },
    {
      id: 3,
      text: "What kind of show are you looking for?",
      options: ["A lighthearted 30-min sitcom", "A serious, hour-long drama", "A complex, thought-provoking story", "An easy-to-watch reality show"],
    },
    {
      id: 4,
      text: "How do you prefer to watch?",
      options: ["Something I can binge in a weekend", "An episodic show I can watch weekly", "A long-running series to get invested in", "Doesn't matter"],
    },
    {
      id: 5,
      text: "What style of show appeals to you?",
      options: ["Classic network television", "Modern streaming original", "British production", "Animated series for adults"],
    },
  ],
};