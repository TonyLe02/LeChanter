<template>
  <div
    id="app"
    class="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans flex flex-col relative overflow-hidden"
  >
    <!-- Title bar with window controls -->
    <div
      class="flex justify-between items-center p-3 bg-black/30 backdrop-blur-md cursor-move drag-region border-b border-white/10"
    >
      <div class="flex items-center space-x-3">
        <span
          :class="
            spotifyConnected
              ? 'bg-green-400 h-2 w-2 rounded-full'
              : 'bg-red-400 h-2 w-2 rounded-full'
          "
        >
        </span>
        <span class="text-sm font-semibold tracking-wide">🎤 LeChant</span>
      </div>

      <!-- Window control buttons -->
      <div class="flex space-x-2 no-drag">
        <button
          @click="minimizeWindow"
          class="w-7 h-7 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/30 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Minimize"
        >
          <span class="text-xs text-yellow-300">−</span>
        </button>
        <button
          @click="maximizeWindow"
          class="w-7 h-7 bg-green-500/20 hover:bg-green-500/40 border border-green-500/30 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Maximize/Restore"
        >
          <span class="text-xs text-green-300">□</span>
        </button>
        <button
          @click="closeWindow"
          class="w-7 h-7 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Close"
        >
          <span class="text-xs text-red-300">×</span>
        </button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="flex-1 flex items-center justify-center p-6">
      <div class="text-center max-w-lg w-full">
        <div class="mb-8">
          <h1
            class="text-4xl font-bold leading-snug bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2"
          >
            Karaoke Overlay
          </h1>
          <p class="text-gray-400 text-sm">
            Real-time music display for your streams
          </p>
        </div>

        <!-- Spotify connection status -->
        <div class="no-drag">
          <button
            v-if="!spotifyConnected"
            @click="connectSpotify"
            class="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none py-4 px-8 rounded-2xl text-sm cursor-pointer transition-all duration-300 font-semibold shadow-lg hover:shadow-green-500/25 hover:-translate-y-1 transform"
          >
            <span class="flex items-center space-x-2">
              <span class="text-lg">🎵</span>
              <span>Connect to Spotify</span>
            </span>
            <div
              class="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            ></div>
          </button>

          <div v-else class="space-y-6">
            <!-- Connection status -->
            <div
              class="flex items-center justify-center space-x-2 text-green-400"
            >
              <div
                class="w-3 h-3 bg-green-500 rounded-full animate-pulse"
              ></div>
              <span class="font-semibold">Connected to Spotify</span>
            </div>

            <!-- Currently Playing Display -->
            <div
              v-if="currentlyPlaying"
              class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div class="flex items-center justify-center mb-4">
                <div class="flex items-center space-x-2 text-green-400">
                  <span class="text-sm font-medium uppercase tracking-wider"
                    >Now Playing</span
                  >
                </div>
              </div>

              <div class="flex items-center space-x-4 mb-4">
                <div class="relative">
                  <img
                    v-if="currentlyPlaying.albumArt"
                    :src="currentlyPlaying.albumArt"
                    alt="Album Art"
                    class="w-16 h-16 rounded-2xl object-cover shadow-lg ring-2 ring-white/20"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 rounded-2xl"
                  ></div>
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-white truncate mb-1">
                    {{ currentlyPlaying.name }}
                  </h3>
                  <p class="text-gray-300 truncate text-sm">
                    {{ currentlyPlaying.artists }}
                  </p>
                </div>

                <div class="text-2xl">
                  <span v-if="currentlyPlaying.isPlaying" class="text-white"
                    >▶</span
                  >
                  <span v-else class="text-gray-400">⏸️</span>
                </div>
              </div>

              <!-- Enhanced Progress bar -->
              <div class="space-y-2">
                <div
                  class="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm"
                >
                  <div
                    class="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300 shadow-sm"
                    :style="{ width: progressPercentage + '%' }"
                  ></div>
                </div>
                <div class="flex justify-between text-xs text-gray-400">
                  <span class="font-mono">{{
                    formatTime(currentlyPlaying.progress / 1000)
                  }}</span>
                  <span class="font-mono">{{
                    formatTime(currentlyPlaying.duration / 1000)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- No music playing -->
            <div v-else class="text-center py-8">
              <div class="text-6xl mb-4 opacity-50">🎵</div>
              <p class="text-gray-400 mb-2">No music currently playing</p>
              <p class="text-gray-500 text-sm">
                Start playing a song in Spotify to see it here
              </p>
            </div>
          </div>
        </div>

        <!-- Debug info (improved styling) -->
        <details class="mt-8 group">
          <summary
            class="cursor-pointer text-xs text-gray-500 hover:text-gray-400 transition-colors select-none"
          >
            Debug Information
          </summary>
          <div
            class="mt-3 p-4 bg-black/20 rounded-lg border border-white/5 text-xs space-y-2"
          >
            <div class="flex justify-between">
              <span class="text-gray-400">Client ID:</span>
              <span class="text-gray-300 font-mono"
                >{{ spotifyClientId?.slice(0, 8) }}...</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Redirect URI:</span>
              <span class="text-gray-300 font-mono text-xs">{{
                spotifyRedirectUri
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Token:</span>
              <span class="text-gray-300">{{
                spotifyToken ? "Present" : "None"
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Status:</span>
              <span
                :class="spotifyConnected ? 'text-green-400' : 'text-red-400'"
              >
                {{ spotifyConnected ? "Connected" : "Disconnected" }}
              </span>
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script>
import SpotifyAPI from "./api/spotify.js";

export default {
  name: "App",
  data() {
    return {
      spotifyConnected: false,
      currentlyPlaying: null,
      authPopup: null,
      spotify: new SpotifyAPI(),
      pollingInterval: null,
    };
  },

  computed: {
    spotifyClientId() {
      return this.spotify.clientId;
    },
    spotifyRedirectUri() {
      return this.spotify.redirectUri;
    },
    spotifyToken() {
      return this.spotify.accessToken;
    },
    progressPercentage() {
      if (!this.currentlyPlaying || !this.currentlyPlaying.duration) return 0;
      return (
        (this.currentlyPlaying.progress / this.currentlyPlaying.duration) * 100
      );
    },
  },

  mounted() {
    console.log("App mounted with Spotify API");

    // Load stored tokens if available
    if (this.spotify.loadStoredTokens()) {
      this.spotifyConnected = true;
      this.startPolling();
      console.log("Loaded stored Spotify tokens");
    }

    window.addEventListener("message", this.handleAuthMessage);
  },

  beforeUnmount() {
    this.stopPolling();
    window.removeEventListener("message", this.handleAuthMessage);
    if (this.authPopup) {
      this.authPopup.close();
    }
  },

  methods: {
    startPolling() {
      this.getCurrentlyPlaying();
      this.pollingInterval = setInterval(() => {
        this.getCurrentlyPlaying();
      }, 3000); // Poll every 3 seconds
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    async getCurrentlyPlaying() {
      try {
        this.currentlyPlaying = await this.spotify.getCurrentlyPlaying();
      } catch (error) {
        console.error("Error fetching currently playing:", error);
        // If token is invalid, disconnect
        if (error.message.includes("401")) {
          this.spotifyConnected = false;
          this.stopPolling();
        }
      }
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },

    minimizeWindow() {
      if (window.electronAPI && window.electronAPI.minimizeWindow) {
        window.electronAPI.minimizeWindow();
      }
    },

    maximizeWindow() {
      if (window.electronAPI && window.electronAPI.maximizeWindow) {
        window.electronAPI.maximizeWindow();
      }
    },

    closeWindow() {
      if (window.electronAPI && window.electronAPI.closeWindow) {
        window.electronAPI.closeWindow();
      }
    },

    async connectSpotify() {
      try {
        this.authPopup = await this.spotify.startAuthFlow();

        if (!this.authPopup) {
          throw new Error("Popup blocked. Please allow popups.");
        }
      } catch (error) {
        console.error("OAuth initiation failed:", error);
        alert(`Failed to start OAuth: ${error.message}`);
      }
    },

    handleAuthMessage(event) {
      console.log("Received message:", event.data);

      if (event.data.type === "spotify_auth_success") {
        const { code, state } = event.data;

        if (this.spotify.validateAuthCallback(code, state)) {
          this.exchangeCodeForToken(code);
        } else {
          console.error("State mismatch");
          alert("Authentication failed: Invalid state");
        }

        if (this.authPopup) {
          this.authPopup.close();
          this.authPopup = null;
        }
      }
    },

    async exchangeCodeForToken(code) {
      try {
        await this.spotify.exchangeCodeForToken(code);
        this.spotifyConnected = true;
        this.startPolling(); // Start polling after successful connection
        alert("Successfully connected to Spotify!");
      } catch (error) {
        console.error("Token exchange failed:", error);
        alert(`Authentication failed: ${error.message}`);
      }
    },
  },
};
</script>

<style>
/* Hide scrollbars globally */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

*::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

body,
html {
  overflow: hidden;
  height: 100%;
}

.drag-region {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}
</style>
