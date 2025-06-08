class SpotifyAPI {
  constructor() {
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    this.redirectUri = "http://127.0.0.1:8000/callback";
    this.scopes = "user-read-currently-playing user-read-playback-state";
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.codeVerifier = null;
  }

  // Generate random string for OAuth state and code verifier
  generateRandomString(length) {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  // Generate PKCE code challenge
  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  // Start OAuth flow
  async startAuthFlow() {
    const state = this.generateRandomString(16);
    this.codeVerifier = this.generateRandomString(128);
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

    localStorage.setItem("spotify_auth_state", state);
    localStorage.setItem("spotify_code_verifier", this.codeVerifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      scope: this.scopes,
      redirect_uri: this.redirectUri,
      state: state,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log("Starting Spotify OAuth:", authUrl);

    return window.open(
      authUrl,
      "spotify-auth",
      "width=500,height=700,scrollbars=yes,resizable=yes"
    );
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    const codeVerifier = localStorage.getItem("spotify_code_verifier");

    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: codeVerifier,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Token exchange failed: ${
          errorData.error_description || errorData.error
        }`
      );
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;

    this.storeTokens();
    this.cleanupAuth();

    return data;
  }

  // Get currently playing track
  async getCurrentlyPlaying() {
    if (!this.accessToken) return null;

    // Check if token needs refresh
    if (this.tokenExpiry && Date.now() >= this.tokenExpiry - 60000) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) return null;
    }

    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      if (data && data.item) {
        return {
          name: data.item.name,
          artists: data.item.artists.map((artist) => artist.name).join(", "),
          album: data.item.album.name,
          albumArt: data.item.album.images?.[0]?.url,
          duration: data.item.duration_ms,
          progress: data.progress_ms,
          isPlaying: data.is_playing,
        };
      }
    } else if (response.status === 204) {
      return null;
    } else if (response.status === 401) {
      await this.refreshAccessToken();
      return null;
    }

    return null;
  }

  // Refresh access token
  async refreshAccessToken() {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
          client_id: this.clientId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + data.expires_in * 1000;
        this.storeTokens();
        return true;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }

    this.clearTokens();
    return false;
  }

  // Store tokens in localStorage
  storeTokens() {
    localStorage.setItem("spotify_access_token", this.accessToken);
    localStorage.setItem("spotify_refresh_token", this.refreshToken);
    localStorage.setItem("spotify_token_expiry", this.tokenExpiry.toString());
  }

  // Load tokens from localStorage
  loadStoredTokens() {
    const accessToken = localStorage.getItem("spotify_access_token");
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    const tokenExpiry = localStorage.getItem("spotify_token_expiry");

    if (accessToken && refreshToken && tokenExpiry) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = parseInt(tokenExpiry);
      return true;
    }
    return false;
  }

  // Clear stored tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;

    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expiry");
  }

  // Clean up auth data
  cleanupAuth() {
    localStorage.removeItem("spotify_code_verifier");
    localStorage.removeItem("spotify_auth_state");
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }

  // Validate auth callback
  validateAuthCallback(code, state) {
    const storedState = localStorage.getItem("spotify_auth_state");
    return state === storedState;
  }
}

export default SpotifyAPI;
