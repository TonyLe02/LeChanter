<template>
  <div
    id="app"
    :class="[
      'h-screen font-sans flex flex-col relative overflow-hidden transition-all duration-300',
      isTransparent
        ? 'bg-transparent text-white'
        : 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white',
    ]"
  >
    <!-- Title bar with window controls (hidden in fullscreen lyrics mode) -->
    <div
      v-if="!isFullscreenLyrics"
      class="flex justify-between ite-center p-3 bg-black/30 backdrop-blur-md cursor-move drag-region border-b border-white/10"
    >
      <div class="flex ite-center space-x-3">
        <span class="text-sm font-semibold tracking-wide">🎤 LeChant.</span>
      </div>

      <!-- Window control buttons -->
      <div class="flex space-x-2 no-drag">
        <button
          @click="minimizeWindow"
          class="w-7 h-7 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/30 rounded-lg flex ite-center justify-center transition-all duration-200 hover:scale-110"
          title="Minimize"
        >
          <span class="text-xs text-yellow-300">−</span>
        </button>
        <button
          @click="maximizeWindow"
          class="w-7 h-7 bg-green-500/20 hover:bg-green-500/40 border border-green-500/30 rounded-lg flex ite-center justify-center transition-all duration-200 hover:scale-110"
          title="Maximize/Restore"
        >
          <span class="text-xs text-green-300">□</span>
        </button>
        <button
          @click="closeWindow"
          class="w-7 h-7 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-lg flex ite-center justify-center transition-all duration-200 hover:scale-110"
          title="Close"
        >
          <span class="text-xs text-red-300">×</span>
        </button>
      </div>
    </div>

    <!-- Fullscreen Lyrics Mode -->
    <div
      v-if="isFullscreenLyrics"
      class="flex-1 flex flex-col justify-center items-center p-8 relative"
      :class="isTransparent ? 'bg-transparent' : 'bg-black/80'"
    >
      <!-- Fullscreen controls overlay -->
      <div class="absolute top-4 right-4 z-20 flex space-x-2 no-drag">
        <button
          @click="toggleFocusMode"
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110',
            isTransparent
              ? 'bg-white/20 hover:bg-white/30 border border-white/30'
              : 'bg-gray-800/50 hover:bg-gray-700/50 border border-white/10',
          ]"
          title="Toggle Focus Mode"
        >
          <span class="text-sm">🎯</span>
        </button>

        <button
          @click="toggleTransparency"
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110',
            isTransparent
              ? 'bg-white/20 hover:bg-white/30 border border-white/30'
              : 'bg-gray-800/50 hover:bg-gray-700/50 border border-white/10',
          ]"
          title="Toggle Transparency"
        >
          <span class="text-sm">👁️</span>
        </button>

        <button
          @click="exitFullscreenLyrics"
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110',
            isTransparent
              ? 'bg-white/20 hover:bg-white/30 border border-white/30'
              : 'bg-gray-800/50 hover:bg-gray-700/50 border border-white/10',
          ]"
          title="Exit Fullscreen"
        >
          <span class="text-sm text-white">✕</span>
        </button>
      </div>

      <!-- Offset controls overlay -->
      <div
        v-if="lyrics && !isFocusMode"
        class="absolute top-4 left-4 z-20 no-drag"
      >
        <!-- BPM Speed Controls -->
        <div class="flex items-center space-x-2">
          <span
            :class="[
              'text-xs px-2 py-1 rounded',
              isTransparent
                ? 'bg-white/10 text-white/80'
                : 'bg-gray-700/50 text-gray-300',
            ]"
          >
            BPM
          </span>

          <button
            @click="adjustBpm(-10)"
            :class="[
              'px-2 py-1 rounded text-xs transition-all duration-200 hover:scale-105',
              isTransparent
                ? 'bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/50'
                : 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30',
            ]"
            title="Slower lyrics"
          >
            -10
          </button>

          <!-- BPM display and input -->
          <div class="flex items-center">
            <span
              v-if="!showBpmInput"
              @click="showBpmInput = true"
              :class="[
                'text-xs px-3 py-1 rounded cursor-pointer hover:bg-opacity-80 transition-all duration-200 min-w-12 text-center',
                isTransparent
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-gray-800/50 hover:bg-gray-700/50',
              ]"
              title="Click to edit BPM"
            >
              {{ currentBpm }}
            </span>

            <input
              v-else
              ref="bpmInput"
              v-model="bpmInputValue"
              @blur="applyBpmInput"
              @keyup.enter="applyBpmInput"
              @keyup.escape="cancelBpmInput"
              :class="[
                'text-xs px-2 py-1 rounded w-16 text-center',
                isTransparent
                  ? 'bg-white/30 border border-white/50 text-white placeholder-white/70'
                  : 'bg-gray-700/80 border border-white/20 text-white placeholder-gray-400',
              ]"
              placeholder="BPM"
              type="number"
              step="1"
              min="1"
            />
          </div>

          <button
            @click="adjustBpm(10)"
            :class="[
              'px-2 py-1 rounded text-xs transition-all duration-200 hover:scale-105',
              isTransparent
                ? 'bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/50'
                : 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30',
            ]"
            title="Faster lyrics"
          >
            +10
          </button>

          <button
            @click="resetBpm"
            :class="[
              'px-2 py-1 rounded text-xs transition-all duration-200 hover:scale-105',
              isTransparent
                ? 'bg-green-500/30 hover:bg-green-500/40 border border-green-400/50'
                : 'bg-green-600/20 hover:bg-green-600/30 border border-green-500/30',
            ]"
            title="Reset to 120 BPM"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Fullscreen lyrics display -->
      <div
        class="w-full max-w-4xl text-center flex flex-col items-center justify-center min-h-0"
      >
        <div v-if="currentlyPlaying && !isFocusMode" class="mb-8">
          <h2 class="text-3xl font-bold text-white mb-2">
            {{ currentlyPlaying.name }}
          </h2>
          <p class="text-xl text-gray-300">
            {{ currentlyPlaying.artists }}
          </p>
        </div>

        <div
          v-if="lyrics && lyrics.lines"
          class="space-y-4 w-full flex-1 flex flex-col justify-center"
        >
          <!-- Focus Mode: Show only current and next few lines -->
          <template v-if="isFocusMode">
            <div
              class="flex flex-col justify-center items-center space-y-6 min-h-[60vh]"
            >
              <div
                v-for="(line, index) in focusedLyrics"
                :key="index"
                @click="syncToLyricLine(line.actualIndex)"
                :class="[
                  'transition-all duration-500 p-6 rounded-lg leading-relaxed text-center max-w-4xl cursor-pointer hover:bg-white/5',
                  line.isCurrent
                    ? 'text-white scale-110 font-bold text-4xl text-shadow-lg'
                    : line.isNext
                    ? 'text-gray-300 text-2xl opacity-80 hover:text-gray-200'
                    : 'text-gray-500 text-xl opacity-40 hover:text-gray-400 hover:opacity-60',
                ]"
                title="🎯 Click to sync lyrics to this line"
              >
                {{ line.text }}
              </div>
            </div>
          </template>

          <!-- Normal Mode: Show all lyrics -->
          <template v-else>
            <div
              class="flex flex-col justify-center items-center space-y-4 min-h-[60vh] max-h-[70vh] overflow-y-auto"
            >
              <div
                v-for="(line, index) in syncedLyrics"
                :key="index"
                @click="syncToLyricLine(index)"
                :class="[
                  'transition-all duration-500 p-4 rounded-lg text-xl leading-relaxed max-w-4xl w-full text-center cursor-pointer hover:bg-white/5',
                  isCurrentLyricLine(index)
                    ? 'text-white scale-110 font-bold text-shadow-lg'
                    : 'text-gray-400 opacity-60 hover:text-gray-300 hover:opacity-80',
                ]"
                title="🎯 Click to sync lyrics to this line"
              >
                {{ line }}
              </div>
            </div>
          </template>
        </div>

        <div
          v-else-if="loadingLyrics"
          class="text-center text-gray-400 flex flex-col justify-center items-center min-h-[60vh]"
        >
          <div class="animate-spin text-6xl mb-4">🎶</div>
          <p class="text-2xl">Loading lyrics...</p>
        </div>

        <div
          v-else
          class="text-center text-gray-400 flex flex-col justify-center items-center min-h-[60vh]"
        >
          <div class="text-8xl mb-4">🎶</div>
          <p class="text-2xl">No lyrics available</p>
        </div>
      </div>
    </div>

    <!-- Main content area (hidden in fullscreen lyrics mode) -->
    <div v-else class="flex-1 flex items-center justify-center p-6">
      <div class="text-center max-w-lg w-full">
        <div class="mb-8">
          <h1
            class="text-4xl font-bold leading-snug bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2"
          >
            Karaoke Overlay
          </h1>
          <p class="text-gray-400 text-sm">
            Real-time music display for your strea
          </p>
        </div>

        <!-- Spotify connection status -->
        <div class="no-drag">
          <button
            v-if="!spotifyConnected"
            @click="connectSpotify"
            class="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none py-4 px-8 rounded-2xl text-sm cursor-pointer transition-all duration-300 font-semibold shadow-lg hover:shadow-green-500/25 hover:-translate-y-1 transform"
          >
            <span class="flex ite-center space-x-2">
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
              <div class="flex ite-center justify-center mb-4">
                <div class="flex ite-center space-x-2 text-green-400">
                  <span class="text-sm font-medium uppercase tracking-wider"
                    >Now Playing</span
                  >
                </div>
              </div>

              <div class="flex ite-center space-x-4 mb-4">
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

        <!-- Lyrics Toggle Button -->
        <div class="mt-4 flex justify-center space-x-2">
          <button
            @click="toggleLyrics"
            class="bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/30 rounded-lg px-4 py-2 text-sm transition-all duration-200 hover:scale-105 flex ite-center space-x-2"
          >
            <span>🎤</span>
            <span>{{ showLyrics ? "Hide Lyrics" : "Show Lyrics" }}</span>
          </button>

          <!-- Fullscreen Button -->
          <button
            v-if="lyrics"
            @click="enterFullscreenLyrics"
            class="bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 rounded-lg px-4 py-2 text-sm transition-all duration-200 hover:scale-105 flex ite-center space-x-2"
          >
            <span>⛶</span>
            <span>Fullscreen</span>
          </button>

          <!-- BPM Control in main interface -->
          <div v-if="showLyrics && lyrics" class="flex items-center space-x-2">
            <span class="text-xs text-gray-400">BPM:</span>

            <button
              @click="adjustBpm(-10)"
              class="bg-gray-600/20 hover:bg-gray-600/40 border border-gray-600/30 rounded px-2 py-1 text-xs transition-all duration-200"
              title="Slower lyrics"
            >
              -10
            </button>

            <span
              v-if="!showBpmInput"
              @click="showBpmInputField"
              class="text-xs text-gray-400 min-w-12 text-center cursor-pointer hover:text-gray-300 transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-600/20"
              title="Click to edit BPM"
            >
              {{ currentBpm }}
            </span>

            <input
              v-else
              ref="bpmInput"
              v-model="bpmInputValue"
              @blur="applyBpmInput"
              @keyup.enter="applyBpmInput"
              @keyup.escape="cancelBpmInput"
              class="text-xs text-center w-12 px-2 py-1 rounded bg-gray-700/80 border border-gray-600/50 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none"
              placeholder="BPM"
              type="number"
              step="1"
              min="1"
            />

            <button
              @click="adjustBpm(10)"
              class="bg-gray-600/20 hover:bg-gray-600/40 border border-gray-600/30 rounded px-2 py-1 text-xs transition-all duration-200"
              title="Faster lyrics"
            >
              +10
            </button>
          </div>
        </div>

        <!-- Debug info (improved styling) -->
        <details class="mt-8 group">
          <summary
            class="cursor-pointer text-xs mb-4 text-gray-500 hover:text-gray-400 transition-colors select-none"
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

        <!-- Lyrics Display -->
        <div
          v-if="currentlyPlaying && showLyrics"
          ref="lyricsContainer"
          class="bg-gradient-to-br from-purple-900/30 mt-4 to-purple-800/30 backdrop-blur-md border border-purple-500/20 rounded-3xl p-6 shadow-2xl max-h-80 overflow-y-auto scroll-smooth"
        >
          <div class="text-center mb-4">
            <span
              class="text-sm font-medium uppercase tracking-wider text-purple-300"
            >
              🎵 Karaoke Mode
            </span>
            <p v-if="lyrics" class="text-xs text-gray-400 mt-1">
              BPM: {{ currentBpm }} ({{ (currentBpm / 120).toFixed(2) }}x speed)
              |
              <span class="text-purple-300">🎯 Click any lyric to sync</span>
            </p>
          </div>

          <!-- Lyrics content -->
          <div v-if="lyrics && lyrics.lines" class="space-y-2">
            <div
              v-for="(line, index) in syncedLyrics"
              :key="index"
              @click="syncToLyricLine(index)"
              :ref="
                (el) => {
                  if (el) lyricRefs[index] = el;
                }
              "
              :class="[
                'text-center transition-all duration-300 p-2 rounded-lg text-sm leading-relaxed cursor-pointer hover:bg-purple-500/10',
                isCurrentLyricLine(index)
                  ? 'text-white bg-purple-500/20 scale-105 font-bold shadow-lg'
                  : 'text-gray-400',
              ]"
              title="Click to sync to this lyric"
            >
              {{ line }}
            </div>
          </div>

          <!-- Loading lyrics -->
          <div v-else-if="loadingLyrics" class="text-center text-gray-400">
            <div class="animate-spin text-2xl mb-2">🎶</div>
            <p class="text-sm">Loading lyrics...</p>
          </div>

          <!-- No lyrics available -->
          <div v-else class="text-center text-gray-400">
            <div class="text-4xl mb-2">🎶</div>
            <p class="text-sm">Lyrics not available for this song</p>
            <p class="text-xs text-gray-500 mt-2">
              {{ currentlyPlaying.name }} by {{ currentlyPlaying.artists }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SpotifyAPI from "./api/spotify.js";
import LyricsAPI from "./api/lyrics.js";

export default {
  name: "App",
  data() {
    return {
      spotifyConnected: false,
      currentlyPlaying: null,
      authPopup: null,
      spotify: new SpotifyAPI(),
      lyricsAPI: new LyricsAPI(),
      pollingInterval: null,
      showLyrics: false,
      lyrics: null,
      loadingLyrics: false,
      lastTrackId: null,
      currentLyricIndex: 0,
      isFullscreenLyrics: false,
      isTransparent: false,
      isFocusMode: false,
      lyricRefs: [],
      lastScrolledIndex: -1,
      currentBpm: 120, // Default BPM for lyrics speed
      showBpmInput: false,
      bpmInputValue: "",
      syncOffset: 3000, // Default 3s offset to compensate for Spotify delay
      syncStartTime: 0, // Time when sync was set (song progress)
      syncStartLine: 0, // Lyric line index when sync was set
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
    syncedLyrics() {
      if (!this.lyrics || !this.lyrics.lines) return [];
      return this.lyrics.lines;
    },
    focusedLyrics() {
      if (!this.lyrics || !this.lyrics.lines || !this.isFocusMode) return [];

      const currentIndex = this.getCurrentLyricIndex();
      const totalLines = this.lyrics.lines.length;
      const focusRange = 3; // Show current + 2 next lines

      const focusedLines = [];

      for (
        let i = Math.max(0, currentIndex - 1);
        i < Math.min(totalLines, currentIndex + focusRange);
        i++
      ) {
        focusedLines.push({
          text: this.lyrics.lines[i],
          isCurrent: i === currentIndex,
          isNext: i === currentIndex + 1,
          isPrevious: i === currentIndex - 1,
          actualIndex: i, // Add actual index for sync
        });
      }

      return focusedLines;
    },
    lyricsSpeedMultiplier() {
      // Calculate speed multiplier based on BPM (120 BPM = 1.0x speed)
      return this.currentBpm / 120;
    },
  },

  mounted() {
    console.log("App mounted with Spotify API");

    // Load stored BPM setting
    const savedBpm = localStorage.getItem("lyrics_bpm");
    if (savedBpm) {
      this.currentBpm = parseInt(savedBpm);
    } else {
      // Set default and save it
      this.currentBpm = 120;
      localStorage.setItem("lyrics_bpm", "120");
    }

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

  watch: {
    // Watch for changes in current lyric line and auto-scroll
    currentLyricIndex(newIndex, oldIndex) {
      if (newIndex !== oldIndex && newIndex !== this.lastScrolledIndex) {
        this.scrollToCurrentLyric(newIndex);
      }
    },
  },

  methods: {
    startPolling() {
      this.getCurrentlyPlaying();
      this.pollingInterval = setInterval(() => {
        this.getCurrentlyPlaying();
      }, 1000); // Reduced to 1 second for better responsiveness
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    adjustOffset(change) {
      this.offset += change;
      localStorage.setItem("lyrics_offset", this.offset.toString());
    },

    quickAdjustOffset(amount) {
      this.offset += amount;
      localStorage.setItem("lyrics_offset", this.offset.toString());
    },

    showOffsetInputField() {
      this.showOffsetInput = true;
      this.offsetInputValue = this.offset.toString();
      this.$nextTick(() => {
        if (this.$refs.offsetInput) {
          this.$refs.offsetInput.focus();
          this.$refs.offsetInput.select();
        }
      });
    },

    applyOffsetInput() {
      const newOffset = parseInt(this.offsetInputValue);
      if (!isNaN(newOffset)) {
        this.offset = newOffset;
        localStorage.setItem("lyrics_offset", this.offset.toString());
      }
      this.showOffsetInput = false;
    },

    cancelOffsetInput() {
      this.showOffsetInput = false;
      this.offsetInputValue = "";
    },

    toggleLyrics() {
      this.showLyrics = !this.showLyrics;
      if (this.showLyrics && this.currentlyPlaying) {
        this.fetchLyrics();
      }
    },

    async fetchLyrics() {
      if (!this.currentlyPlaying) return;

      this.loadingLyrics = true;
      try {
        const artist = this.currentlyPlaying.artists.split(",")[0].trim(); // Get first artist
        const title = this.currentlyPlaying.name;

        console.log(`Fetching lyrics for: "${title}" by "${artist}"`);

        const lyricsData = await this.lyricsAPI.getLyrics(artist, title);
        this.lyrics = lyricsData;

        if (lyricsData) {
          console.log(`Loaded ${lyricsData.lines.length} lyrics lines`);
          // Reset scroll tracking when new lyrics load
          this.lastScrolledIndex = -1;
          this.lyricRefs = [];
        } else {
          console.log("No lyrics found");
        }
      } catch (error) {
        console.error("Error fetching lyrics:", error);
        this.lyrics = null;
      } finally {
        this.loadingLyrics = false;
      }
    },

    isCurrentLyricLine(lineIndex) {
      if (
        !this.currentlyPlaying ||
        !this.currentlyPlaying.isPlaying ||
        !this.lyrics
      )
        return false;

      const currentProgress = this.currentlyPlaying.progress;
      const totalLines = this.lyrics.lines.length;
      const duration = this.currentlyPlaying.duration;

      // Calculate progress since sync point
      const progressSinceSync = currentProgress - this.syncStartTime;

      // Apply BPM multiplier to progress
      const bpmMultiplier = this.currentBpm / 120;
      const adjustedProgressSinceSync = progressSinceSync * bpmMultiplier;

      // Calculate expected line based on sync point
      const progressRatio = adjustedProgressSinceSync / duration;
      const linesSinceSync = progressRatio * totalLines;
      const expectedLineIndex = Math.floor(this.syncStartLine + linesSinceSync);

      // Clamp to valid range
      const clampedLineIndex = Math.max(
        0,
        Math.min(totalLines - 1, expectedLineIndex)
      );

      // Update current lyric index for auto-scroll
      if (clampedLineIndex !== this.currentLyricIndex) {
        this.currentLyricIndex = clampedLineIndex;
      }

      // Highlight current line with buffer for better UX
      const buffer = 1;
      return (
        Math.abs(lineIndex - clampedLineIndex) <= buffer &&
        lineIndex === clampedLineIndex
      );
    },

    scrollToCurrentLyric(index) {
      this.$nextTick(() => {
        if (this.$refs.lyricsContainer && this.lyricRefs[index]) {
          const container = this.$refs.lyricsContainer;
          const currentLyric = this.lyricRefs[index];

          if (currentLyric) {
            // Calculate the position to center the current lyric
            const containerHeight = container.clientHeight;
            const lyricTop = currentLyric.offsetTop;
            const lyricHeight = currentLyric.clientHeight;

            // Center the lyric in the container
            const scrollTop = lyricTop - containerHeight / 2 + lyricHeight / 2;

            // Smooth scroll to the calculated position
            container.scrollTo({
              top: Math.max(0, scrollTop),
              behavior: "smooth",
            });

            this.lastScrolledIndex = index;
          }
        }
      });
    },

    getCurrentLyricIndex() {
      if (
        !this.currentlyPlaying ||
        !this.currentlyPlaying.isPlaying ||
        !this.lyrics
      )
        return 0;

      const currentProgress = this.currentlyPlaying.progress;
      const totalLines = this.lyrics.lines.length;
      const duration = this.currentlyPlaying.duration;

      // Calculate progress since sync point
      const progressSinceSync = currentProgress - this.syncStartTime;

      // Apply BPM multiplier to progress
      const bpmMultiplier = this.currentBpm / 120;
      const adjustedProgressSinceSync = progressSinceSync * bpmMultiplier;

      // Calculate expected line based on sync point
      const progressRatio = adjustedProgressSinceSync / duration;
      const linesSinceSync = progressRatio * totalLines;
      const expectedLineIndex = Math.floor(this.syncStartLine + linesSinceSync);

      // Clamp to valid range
      return Math.max(0, Math.min(totalLines - 1, expectedLineIndex));
    },

    syncToLyricLine(lineIndex) {
      if (!this.currentlyPlaying || !this.lyrics) return;

      // Set sync point to current time and selected lyric
      this.syncStartTime = this.currentlyPlaying.progress;
      this.syncStartLine = lineIndex;

      console.log(
        `🎯 Synced to lyric ${lineIndex}: "${this.lyrics.lines[lineIndex]}" | Start time: ${this.syncStartTime}ms | BPM: ${this.currentBpm}`
      );

      // Force update the current lyric index immediately
      this.currentLyricIndex = lineIndex;
    },

    async getCurrentlyPlaying() {
      try {
        this.currentlyPlaying = await this.spotify.getCurrentlyPlaying();

        // Auto-fetch lyrics if lyrics are showing and song changed
        if (
          this.showLyrics &&
          this.currentlyPlaying &&
          this.currentlyPlaying.name
        ) {
          const trackId = `${this.currentlyPlaying.name}-${this.currentlyPlaying.artists}`;
          if (trackId !== this.lastTrackId) {
            this.lastTrackId = trackId;
            this.fetchLyrics();
          }
        }
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

    toggleFocusMode() {
      this.isFocusMode = !this.isFocusMode;
    },

    enterFullscreenLyrics() {
      this.isFullscreenLyrics = true;
      if (!this.showLyrics) {
        this.showLyrics = true;
        if (this.currentlyPlaying) {
          this.fetchLyrics();
        }
      }
    },

    exitFullscreenLyrics() {
      this.isFullscreenLyrics = false;
      this.isTransparent = false;
      this.isFocusMode = false;
      // Reset window transparency
      if (window.electronAPI && window.electronAPI.setTransparency) {
        window.electronAPI.setTransparency(false);
      }
    },

    toggleTransparency() {
      this.isTransparent = !this.isTransparent;
      // Set window transparency in Electron
      if (window.electronAPI && window.electronAPI.setTransparency) {
        window.electronAPI.setTransparency(this.isTransparent);
      }
    },

    adjustBpm(change) {
      this.currentBpm = Math.max(1, this.currentBpm + change);
      localStorage.setItem("lyrics_bpm", this.currentBpm.toString());
    },

    resetBpm() {
      this.currentBpm = 120;
      localStorage.setItem("lyrics_bpm", "120");
    },

    showBpmInputField() {
      this.showBpmInput = true;
      this.bpmInputValue = this.currentBpm.toString();
      this.$nextTick(() => {
        if (this.$refs.bpmInput) {
          this.$refs.bpmInput.focus();
          this.$refs.bpmInput.select();
        }
      });
    },

    applyBpmInput() {
      const newBpm = parseInt(this.bpmInputValue);
      if (!isNaN(newBpm) && newBpm >= 1) {
        this.currentBpm = newBpm;
        localStorage.setItem("lyrics_bpm", this.currentBpm.toString());
      }
      this.showBpmInput = false;
    },

    cancelBpmInput() {
      this.showBpmInput = false;
      this.bpmInputValue = "";
    },
  },
};
</script>

<style>
/* Hide scrollbars globally */
* {
  scrollbar-width: none; /* Firefox */
  --overflow-style: none; /* IE and Edge */
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

/* Text shadow utility */
.text-shadow-lg {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* Smooth transitions for fullscreen mode */
.transition-all {
  transition: all 0.3s ease;
}

/* Smooth scrolling for lyrics container */
.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
