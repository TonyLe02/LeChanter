class LyricsAPI {
  constructor() {
    this.cache = new Map();
  }

  async getLyrics(artist, title) {
    const cacheKey = `${artist}-${title}`.toLowerCase();

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Try lyrics.ovh first (free, no API key needed)
      let lyrics = await this.fetchFromLyricsOVH(artist, title);

      if (!lyrics) {
        // Fallback to lyrist API
        lyrics = await this.fetchFromLyrist(artist, title);
      }

      if (lyrics) {
        this.cache.set(cacheKey, lyrics);
        return lyrics;
      }

      return null;
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      return null;
    }
  }

  async fetchFromLyricsOVH(artist, title) {
    try {
      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(
          artist
        )}/${encodeURIComponent(title)}`
      );

      if (response.ok) {
        const data = await response.json();
        return this.parseLyricsText(data.lyrics);
      }
    } catch (error) {
      console.log("lyrics.ovh failed:", error);
    }
    return null;
  }

  async fetchFromLyrist(artist, title) {
    try {
      const response = await fetch(
        `https://lyrist.vercel.app/api/${encodeURIComponent(
          title
        )}/${encodeURIComponent(artist)}`
      );

      if (response.ok) {
        const data = await response.json();
        return this.parseLyricsText(data.lyrics);
      }
    } catch (error) {
      console.log("lyrist failed:", error);
    }
    return null;
  }

  parseLyricsText(lyricsText) {
    if (!lyricsText) return null;

    // Clean up lyrics text
    const cleanText = lyricsText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();

    // Split into lines and filter out empty lines
    const lines = cleanText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return null;

    return {
      text: cleanText,
      lines: lines,
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

export default LyricsAPI;
