const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const TOKEN_KEY = "song-language-sorter-token";
const VERIFIER_KEY = "song-language-sorter-verifier";
const SOURCE_LIKED = "liked";
const SOURCE_PLAYLIST = "playlist";
const CONFIG = window.SONG_LANGUAGE_SORTER_CONFIG || {};

const SCOPES = [
  "user-read-private",
  "user-library-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "de", name: "German" },
  { code: "nl", name: "Dutch" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "sv", name: "Swedish" },
  { code: "ar", name: "Arabic" },
  { code: "he", name: "Hebrew" },
  { code: "ru", name: "Russian" },
  { code: "uk", name: "Ukrainian" },
  { code: "el", name: "Greek" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "unknown", name: "Needs review" },
];

const LATIN_LANGUAGE_HINTS = {
  es: ["el", "la", "los", "las", "de", "del", "que", "con", "para", "por", "mi", "tu", "amor", "vida", "corazon", "noche", "cancion"],
  fr: ["le", "la", "les", "des", "pour", "avec", "mon", "ma", "mes", "amour", "vie", "nuit", "coeur", "dans"],
  pt: ["o", "a", "os", "as", "de", "do", "da", "que", "com", "para", "meu", "minha", "amor", "vida", "noite"],
  it: ["il", "lo", "la", "gli", "che", "con", "per", "mio", "mia", "amore", "vita", "notte", "cuore"],
  de: ["der", "die", "das", "und", "mit", "ich", "du", "mein", "meine", "liebe", "nacht", "leben"],
  nl: ["de", "het", "een", "ik", "jij", "mijn", "liefde", "nacht", "leven", "voor", "met"],
  tr: ["ve", "bir", "ben", "sen", "ask", "gece", "kalp", "hayat", "icin", "gibi"],
  pl: ["i", "w", "na", "nie", "jest", "moje", "milosc", "noc", "zycie", "serce"],
  sv: ["och", "jag", "du", "min", "mitt", "karlek", "natt", "liv", "hjarta"],
  en: ["the", "and", "you", "me", "my", "your", "love", "heart", "night", "life", "baby", "with", "for"],
};

const DIACRITIC_HINTS = [
  { regex: /[\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00bf\u00a1]/i, code: "es" },
  { regex: /[\u00e0\u00e2\u00e7\u00e8\u00e9\u00ea\u00eb\u00ee\u00ef\u00f4\u00f9\u00fb\u00fc\u0153]/i, code: "fr" },
  { regex: /[\u00e3\u00f5\u00e1\u00e9\u00ed\u00f3\u00fa\u00e7]/i, code: "pt" },
  { regex: /[\u00e0\u00e8\u00e9\u00ec\u00f2\u00f9]/i, code: "it" },
  { regex: /[\u00e4\u00f6\u00fc\u00df]/i, code: "de" },
  { regex: /[\u011f\u0131\u015f\u00e7\u00f6\u00fc]/i, code: "tr" },
  { regex: /[\u0105\u0107\u0119\u0142\u0144\u00f3\u015b\u017a\u017c]/i, code: "pl" },
  { regex: /[\u00e5\u00e4\u00f6]/i, code: "sv" },
];

const SCRIPT_HINTS = [
  { regex: /[\u0600-\u06ff]/, code: "ar" },
  { regex: /[\u0590-\u05ff]/, code: "he" },
  { regex: /[\u0400-\u04ff]/, code: "ru" },
  { regex: /[\u0370-\u03ff]/, code: "el" },
  { regex: /[\u0900-\u097f]/, code: "hi" },
  { regex: /[\u0b80-\u0bff]/, code: "ta" },
  { regex: /[\u0c00-\u0c7f]/, code: "te" },
  { regex: /[\u0e00-\u0e7f]/, code: "th" },
  { regex: /[\u3040-\u30ff]/, code: "ja" },
  { regex: /[\uac00-\ud7af]/, code: "ko" },
  { regex: /[\u4e00-\u9fff]/, code: "zh" },
];

const els = {
  appModeBadge: document.querySelector("#appModeBadge"),
  loginButton: document.querySelector("#loginButton"),
  logoutButton: document.querySelector("#logoutButton"),
  statusPanel: document.querySelector("#statusPanel"),
  profileBadge: document.querySelector("#profileBadge"),
  likedSourceButton: document.querySelector("#likedSourceButton"),
  playlistSourceButton: document.querySelector("#playlistSourceButton"),
  playlistField: document.querySelector("#playlistField"),
  playlistInput: document.querySelector("#playlistInput"),
  minimumInput: document.querySelector("#minimumInput"),
  mainLanguageSelect: document.querySelector("#mainLanguageSelect"),
  includeMainLanguage: document.querySelector("#includeMainLanguage"),
  privatePlaylists: document.querySelector("#privatePlaylists"),
  analyzeButton: document.querySelector("#analyzeButton"),
  createButton: document.querySelector("#createButton"),
  emptyState: document.querySelector("#emptyState"),
  languageGroups: document.querySelector("#languageGroups"),
  songCount: document.querySelector("#songCount"),
  languageCount: document.querySelector("#languageCount"),
  selectedSummary: document.querySelector("#selectedSummary"),
  selectedDetail: document.querySelector("#selectedDetail"),
  languageCardTemplate: document.querySelector("#languageCardTemplate"),
  trackRowTemplate: document.querySelector("#trackRowTemplate"),
};

const state = {
  source: SOURCE_LIKED,
  token: readJson(TOKEN_KEY),
  profile: null,
  tracks: [],
  selectedLanguages: new Map(),
  selectedGenreGroups: new Map(),
  genreSplits: new Map(),
  artistGenreCache: new Map(),
  activeGroups: new Map(),
  sourceName: "Liked Songs",
  lastCreated: [],
};

init();

async function init() {
  populateLanguageOptions();
  localStorage.removeItem("song-language-sorter-client-id");
  wireEvents();
  await finishLoginIfNeeded();
  await refreshProfile();
  renderAuthState();
  renderGroups();
}

function wireEvents() {
  els.loginButton.addEventListener("click", startLogin);
  els.logoutButton.addEventListener("click", logout);
  els.analyzeButton.addEventListener("click", analyze);
  els.createButton.addEventListener("click", createSelectedPlaylists);
  els.minimumInput.addEventListener("input", () => {
    clearCompletion();
    syncDefaultSelections();
    renderGroups();
  });
  els.mainLanguageSelect.addEventListener("change", () => {
    clearCompletion();
    syncDefaultSelections();
    renderGroups();
  });
  els.includeMainLanguage.addEventListener("change", () => {
    clearCompletion();
    syncDefaultSelections();
    renderGroups();
  });
  els.privatePlaylists.addEventListener("change", () => {
    clearCompletion();
    updateCreateSummary();
  });
  els.likedSourceButton.addEventListener("click", () => setSource(SOURCE_LIKED));
  els.playlistSourceButton.addEventListener("click", () => setSource(SOURCE_PLAYLIST));
}

function populateLanguageOptions() {
  LANGUAGES.forEach((language) => {
    const mainOption = document.createElement("option");
    mainOption.value = language.code;
    mainOption.textContent = language.name;
    els.mainLanguageSelect.append(mainOption);
  });
}

async function startLogin() {
  const clientId = getConfiguredClientId();
  if (!isValidSpotifyClientId(clientId)) {
    showStatus("App setup needed: add your Spotify app Client ID in config.js, then reload.", "error");
    renderAuthState();
    return;
  }

  const verifier = generateRandomString(96);
  const challenge = await createCodeChallenge(verifier);
  localStorage.setItem(VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES.join(" "),
    redirect_uri: window.location.origin + window.location.pathname,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

async function finishLoginIfNeeded() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    showStatus(`Spotify sign-in failed: ${error}`, "error");
    history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  if (!code) return;

  const clientId = getConfiguredClientId();
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!clientId || !verifier) {
    showStatus("The login verifier was missing. Please connect again.", "error");
    return;
  }

  showStatus("Finishing Spotify sign-in...");
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: window.location.origin + window.location.pathname,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    showStatus(`Token exchange failed: ${message}`, "error");
    return;
  }

  const token = await response.json();
  token.expires_at = Date.now() + token.expires_in * 1000;
  state.token = token;
  writeJson(TOKEN_KEY, token);
  localStorage.removeItem(VERIFIER_KEY);
  history.replaceState({}, document.title, window.location.pathname);
  showStatus("Connected to Spotify.");
}

async function refreshProfile() {
  if (!hasSession()) return;
  try {
    state.profile = await spotifyFetch("/me");
    els.profileBadge.textContent = state.profile.display_name || state.profile.id || "Connected";
  } catch (error) {
    showStatus(error.message, "error");
  }
}

function renderAuthState() {
  const connected = hasSession();
  const clientId = getConfiguredClientId();
  const hasInvalidClientId = Boolean(clientId) && !isValidSpotifyClientId(clientId);
  const needsSetup = !clientId || hasInvalidClientId;
  els.loginButton.disabled = needsSetup;
  els.appModeBadge.textContent = needsSetup ? "Setup needed" : "Public app";
  els.loginButton.classList.toggle("hidden", connected);
  els.logoutButton.classList.toggle("hidden", !connected);
  els.analyzeButton.disabled = !connected;
  if (!connected) {
    els.profileBadge.textContent = "Offline";
  }
}

function setSource(source) {
  state.source = source;
  els.likedSourceButton.classList.toggle("active", source === SOURCE_LIKED);
  els.playlistSourceButton.classList.toggle("active", source === SOURCE_PLAYLIST);
  els.likedSourceButton.setAttribute("aria-pressed", String(source === SOURCE_LIKED));
  els.playlistSourceButton.setAttribute("aria-pressed", String(source === SOURCE_PLAYLIST));
  els.playlistField.classList.toggle("hidden", source !== SOURCE_PLAYLIST);
}

async function analyze() {
  if (!hasSession()) {
    showStatus("Connect Spotify first.", "error");
    return;
  }

  try {
    els.analyzeButton.disabled = true;
    showStatus("Loading songs from Spotify...");
    const items = state.source === SOURCE_LIKED ? await getLikedSongs() : await getPlaylistSongs();
    state.tracks = normalizeTracks(items);
    state.tracks.forEach((track) => {
      track.language = detectLanguage(track).code;
    });
    state.selectedLanguages.clear();
    state.selectedGenreGroups.clear();
    state.genreSplits.clear();
    state.artistGenreCache.clear();
    state.lastCreated = [];
    rebuildLanguageSelect();
    syncDefaultSelections();
    renderGroups();
    showStatus(`Analyzed ${state.tracks.length} songs. Review the groups before creating playlists.`);
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    els.analyzeButton.disabled = !hasSession();
  }
}

async function getLikedSongs() {
  state.sourceName = "Liked Songs";
  return spotifyPages("/me/tracks?limit=50", (page) => page.items);
}

async function getPlaylistSongs() {
  const playlistId = parsePlaylistId(els.playlistInput.value.trim());
  if (!playlistId) {
    throw new Error("Paste a Spotify playlist URL or ID.");
  }

  const playlist = await spotifyFetch(`/playlists/${playlistId}?fields=name`);
  state.sourceName = playlist.name || "Playlist";
  return spotifyPages(`/playlists/${playlistId}/tracks?limit=50&additional_types=track`, (page) => page.items);
}

function normalizeTracks(items) {
  const seen = new Set();
  const tracks = [];

  items.forEach((item) => {
    const track = item.track;
    if (!track || track.type !== "track" || !track.uri || seen.has(track.uri)) return;
    seen.add(track.uri);
    tracks.push({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artists: (track.artists || []).map((artist) => artist.name).join(", "),
      artistIds: (track.artists || []).map((artist) => artist.id).filter(Boolean),
      album: track.album?.name || "",
      image: track.album?.images?.at(-1)?.url || track.album?.images?.[0]?.url || "",
      spotifyUrl: track.external_urls?.spotify || "",
      language: "unknown",
      genre: "",
    });
  });

  return tracks;
}

function detectLanguage(track) {
  const sample = `${track.name} ${track.artists} ${track.album}`.toLowerCase();

  for (const hint of SCRIPT_HINTS) {
    if (hint.regex.test(sample)) return { code: hint.code, confidence: "high" };
  }

  for (const hint of DIACRITIC_HINTS) {
    if (hint.regex.test(sample)) return { code: hint.code, confidence: "medium" };
  }

  const words = normalizeWords(sample);
  const scores = Object.entries(LATIN_LANGUAGE_HINTS).map(([code, hints]) => {
    const score = hints.reduce((total, hint) => total + (words.includes(hint) ? 1 : 0), 0);
    return { code, score };
  });
  scores.sort((a, b) => b.score - a.score);

  if (scores[0]?.score >= 2 && scores[0].score > scores[1]?.score) {
    return { code: scores[0].code, confidence: "medium" };
  }

  if (/^[\u0000-\u007f\s"'().,?!:&+-]+$/.test(sample) && words.length > 0) {
    return { code: "en", confidence: "low" };
  }

  return { code: "unknown", confidence: "low" };
}

function normalizeWords(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function rebuildLanguageSelect() {
  const languagesInUse = [...new Set(state.tracks.map((track) => track.language))];
  const previous = els.mainLanguageSelect.value;
  els.mainLanguageSelect.innerHTML = '<option value="auto">Auto detect</option>';

  LANGUAGES.filter((language) => languagesInUse.includes(language.code) || language.code !== "unknown").forEach((language) => {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = language.name;
    els.mainLanguageSelect.append(option);
  });

  if ([...els.mainLanguageSelect.options].some((option) => option.value === previous)) {
    els.mainLanguageSelect.value = previous;
  }
}

function buildGroups() {
  const groups = new Map();
  state.tracks.forEach((track) => {
    if (!groups.has(track.language)) groups.set(track.language, []);
    groups.get(track.language).push(track);
  });

  return new Map([...groups.entries()].sort((a, b) => b[1].length - a[1].length || getLanguageName(a[0]).localeCompare(getLanguageName(b[0]))));
}

function syncDefaultSelections() {
  const groups = buildGroups();
  const mainLanguage = getMainLanguage(groups);
  const minimum = Math.max(1, Number.parseInt(els.minimumInput.value, 10) || 1);

  groups.forEach((tracks, code) => {
    if (!state.selectedLanguages.has(code)) {
      const isMain = code === mainLanguage;
      state.selectedLanguages.set(code, tracks.length >= minimum && (!isMain || els.includeMainLanguage.checked));
    }
  });

  [...state.selectedLanguages.keys()].forEach((code) => {
    if (!groups.has(code)) state.selectedLanguages.delete(code);
  });

  state.genreSplits.forEach((genreGroups, languageCode) => {
    genreGroups.forEach((tracks, genre) => {
      const key = getGenreKey(languageCode, genre);
      if (!state.selectedGenreGroups.has(key)) {
        state.selectedGenreGroups.set(key, tracks.length >= minimum);
      }
    });
  });
}

function renderGroups() {
  state.activeGroups = buildGroups();
  els.languageGroups.innerHTML = "";
  els.emptyState.classList.toggle("hidden", state.tracks.length > 0);
  els.songCount.textContent = `${state.tracks.length} ${state.tracks.length === 1 ? "song" : "songs"}`;
  els.languageCount.textContent = `${state.activeGroups.size} ${state.activeGroups.size === 1 ? "language" : "languages"}`;

  state.activeGroups.forEach((tracks, code) => {
    const card = els.languageCardTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = card.querySelector(".language-checkbox");
    const name = card.querySelector(".language-name");
    const total = card.querySelector(".language-total");
    const genreButton = card.querySelector(".genre-split-button");
    const genreList = card.querySelector(".genre-list");
    const trackList = card.querySelector(".track-list");
    const isSplit = state.genreSplits.has(code);
    const genreGroups = isSplit ? state.genreSplits.get(code) : null;

    checkbox.checked = isSplit ? hasSelectedGenreInLanguage(code) : state.selectedLanguages.get(code) || false;
    checkbox.addEventListener("change", () => {
      if (isSplit) {
        genreGroups.forEach((genreTracks, genre) => {
          state.selectedGenreGroups.set(getGenreKey(code, genre), checkbox.checked);
        });
      } else {
        state.selectedLanguages.set(code, checkbox.checked);
      }
      clearCompletion();
      updateCreateSummary();
      renderGroups();
    });
    name.textContent = getLanguageName(code);
    total.textContent = `${tracks.length} ${tracks.length === 1 ? "song" : "songs"}`;
    genreButton.textContent = isSplit ? "Unsplit" : "Genres";
    genreButton.classList.toggle("active", isSplit);
    genreButton.addEventListener("click", () => toggleGenreSplit(code));

    if (isSplit) {
      renderGenreGroups(code, genreGroups, genreList);
    } else {
      tracks.slice(0, 8).forEach((track) => trackList.append(renderTrackRow(track)));
      if (tracks.length > 8) {
        const more = document.createElement("div");
        more.className = "track-row compact";
        more.textContent = `${tracks.length - 8} more`;
        trackList.append(more);
      }
    }

    els.languageGroups.append(card);
  });

  updateCreateSummary();
}

function renderTrackRow(track) {
  const row = els.trackRowTemplate.content.firstElementChild.cloneNode(true);
  const art = row.querySelector(".track-art");
  const title = row.querySelector(".track-title");
  const artist = row.querySelector(".track-artist");
  const languageSelect = row.querySelector(".track-language");

  art.src = track.image || svgPlaceholder();
  title.textContent = track.name;
  artist.textContent = track.artists || "Unknown artist";

  LANGUAGES.forEach((language) => {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = language.name;
    languageSelect.append(option);
  });
  languageSelect.value = track.language;
  languageSelect.addEventListener("change", () => {
    track.language = languageSelect.value;
    state.selectedLanguages.delete(languageSelect.value);
    clearCompletion();
    syncDefaultSelections();
    renderGroups();
  });

  return row;
}

function renderGenreGroups(languageCode, genreGroups, container) {
  container.innerHTML = "";
  const sortedGroups = [...genreGroups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  sortedGroups.forEach(([genre, tracks]) => {
    const row = document.createElement("section");
    row.className = "genre-row";

    const header = document.createElement("header");
    const label = document.createElement("label");
    label.className = "genre-toggle";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.selectedGenreGroups.get(getGenreKey(languageCode, genre)) || false;
    checkbox.addEventListener("change", () => {
      state.selectedGenreGroups.set(getGenreKey(languageCode, genre), checkbox.checked);
      clearCompletion();
      updateCreateSummary();
    });

    const name = document.createElement("span");
    name.textContent = genre;
    label.append(checkbox, name);

    const total = document.createElement("span");
    total.className = "language-total";
    total.textContent = `${tracks.length} ${tracks.length === 1 ? "song" : "songs"}`;
    header.append(label, total);

    const preview = document.createElement("div");
    preview.className = "genre-preview";
    preview.textContent = tracks.slice(0, 3).map((track) => track.name).join(", ") + (tracks.length > 3 ? "..." : "");

    row.append(header, preview);
    container.append(row);
  });
}

async function toggleGenreSplit(languageCode) {
  clearCompletion();
  if (state.genreSplits.has(languageCode)) {
    state.genreSplits.delete(languageCode);
    [...state.selectedGenreGroups.keys()].forEach((key) => {
      if (key.startsWith(`${languageCode}::`)) state.selectedGenreGroups.delete(key);
    });
    syncDefaultSelections();
    renderGroups();
    return;
  }

  const tracks = state.activeGroups.get(languageCode) || [];
  if (tracks.length === 0) return;

  try {
    showStatus(`Finding genres for ${getLanguageName(languageCode)} songs...`);
    await enrichTracksWithGenres(tracks);
    const genreGroups = buildGenreGroups(tracks);
    state.genreSplits.set(languageCode, genreGroups);
    state.selectedLanguages.set(languageCode, false);
    applyDefaultGenreSelections(languageCode, genreGroups);
    renderGroups();
    showStatus(`Split ${getLanguageName(languageCode)} into ${genreGroups.size} genre groups.`);
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function enrichTracksWithGenres(tracks) {
  const artistIds = [...new Set(tracks.flatMap((track) => track.artistIds || []))];
  const missingArtistIds = artistIds.filter((id) => !state.artistGenreCache.has(id));

  for (let index = 0; index < missingArtistIds.length; index += 50) {
    const ids = missingArtistIds.slice(index, index + 50);
    const response = await spotifyFetch(`/artists?ids=${encodeURIComponent(ids.join(","))}`);
    (response.artists || []).forEach((artist) => {
      state.artistGenreCache.set(artist.id, artist.genres || []);
    });
  }

  tracks.forEach((track) => {
    track.genre = pickTrackGenre(track);
  });
}

function pickTrackGenre(track) {
  for (const artistId of track.artistIds || []) {
    const genres = state.artistGenreCache.get(artistId) || [];
    if (genres.length > 0) return toTitleCase(genres[0]);
  }

  return "Uncategorized";
}

function buildGenreGroups(tracks) {
  const groups = new Map();
  tracks.forEach((track) => {
    const genre = track.genre || "Uncategorized";
    if (!groups.has(genre)) groups.set(genre, []);
    groups.get(genre).push(track);
  });
  return groups;
}

function applyDefaultGenreSelections(languageCode, genreGroups) {
  const minimum = Math.max(1, Number.parseInt(els.minimumInput.value, 10) || 1);
  genreGroups.forEach((tracks, genre) => {
    const key = getGenreKey(languageCode, genre);
    if (!state.selectedGenreGroups.has(key)) {
      state.selectedGenreGroups.set(key, tracks.length >= minimum);
    }
  });
}

function updateCreateSummary() {
  const selected = getSelectedGroups();
  const totalSongs = selected.reduce((sum, group) => sum + group.tracks.length, 0);
  els.createButton.disabled = selected.length === 0 || !hasSession();
  if (state.lastCreated.length > 0) {
    els.selectedSummary.textContent = "Done";
    els.selectedDetail.textContent = `Created ${state.lastCreated.length} ${state.lastCreated.length === 1 ? "playlist" : "playlists"}.`;
    return;
  }
  els.selectedSummary.textContent =
    selected.length === 0 ? "No playlists selected" : `${selected.length} ${selected.length === 1 ? "playlist" : "playlists"} selected`;
  els.selectedDetail.textContent =
    selected.length === 0 ? "Small one-off language buckets are skipped by default." : `${totalSongs} songs will be copied into new ${els.privatePlaylists.checked ? "private" : "public"} playlists.`;
}

function getSelectedGroups() {
  const selected = [];

  state.activeGroups.forEach((tracks, code) => {
    if (state.genreSplits.has(code)) {
      state.genreSplits.get(code).forEach((genreTracks, genre) => {
        if (state.selectedGenreGroups.get(getGenreKey(code, genre))) {
          selected.push({
            code,
            genre,
            tracks: genreTracks,
            playlistName: `${state.sourceName} - ${getLanguageName(code)} - ${genre}`,
          });
        }
      });
      return;
    }

    if (state.selectedLanguages.get(code)) {
      selected.push({
        code,
        tracks,
        playlistName: `${state.sourceName} - ${getLanguageName(code)}`,
      });
    }
  });

  return selected;
}

async function createSelectedPlaylists() {
  const selected = getSelectedGroups();
  if (selected.length === 0) return;

  try {
    clearCompletion();
    els.createButton.disabled = true;
    els.createButton.textContent = "Creating...";
    const privacy = els.privatePlaylists.checked;
    const created = [];

    for (const group of selected) {
      showStatus(`Creating ${group.playlistName}...`);
      const playlist = await spotifyFetch("/me/playlists", {
        method: "POST",
        body: JSON.stringify({
          name: group.playlistName,
          public: !privacy,
          description: `Created by Song Language Sorter from ${state.sourceName}.`,
        }),
      });

      const uris = group.tracks.map((track) => track.uri);
      for (let index = 0; index < uris.length; index += 100) {
        await spotifyFetch(`/playlists/${playlist.id}/items`, {
          method: "POST",
          body: JSON.stringify({ uris: uris.slice(index, index + 100) }),
        });
      }

      created.push(playlist.name || group.playlistName);
    }

    state.lastCreated = created;
    els.selectedSummary.textContent = "Done";
    els.selectedDetail.textContent = `Created ${created.length} ${created.length === 1 ? "playlist" : "playlists"}.`;
    showStatus(`Done. Created ${created.length} playlists: ${created.join(", ")}.`, "success");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    els.createButton.textContent = "Create playlists";
    updateCreateSummary();
  }
}

async function spotifyPages(path, pickItems) {
  const allItems = [];
  let nextPath = path;

  while (nextPath) {
    const page = await spotifyFetch(nextPath);
    allItems.push(...pickItems(page));
    nextPath = page.next ? page.next.replace(SPOTIFY_API_URL, "") : "";
    showStatus(`Loaded ${allItems.length} songs...`);
  }

  return allItems;
}

async function spotifyFetch(path, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(path.startsWith("https://") ? path : `${SPOTIFY_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || "a moment";
    throw new Error(`Spotify rate limited the request. Try again after ${retryAfter} seconds.`);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Spotify API error ${response.status}: ${message}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function getAccessToken() {
  if (!state.token) throw new Error("Connect Spotify first.");
  if (Date.now() < state.token.expires_at - 60_000) return state.token.access_token;
  if (!state.token.refresh_token) throw new Error("Spotify session expired. Connect again.");

  const clientId = getConfiguredClientId();
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: state.token.refresh_token,
    }),
  });

  if (!response.ok) throw new Error("Spotify session refresh failed. Connect again.");
  const refreshed = await response.json();
  state.token = {
    ...state.token,
    ...refreshed,
    refresh_token: refreshed.refresh_token || state.token.refresh_token,
    expires_at: Date.now() + refreshed.expires_in * 1000,
  };
  writeJson(TOKEN_KEY, state.token);
  return state.token.access_token;
}

function getMainLanguage(groups = state.activeGroups) {
  if (els.mainLanguageSelect.value !== "auto") return els.mainLanguageSelect.value;
  return groups.entries().next().value?.[0] || "unknown";
}

function getLanguageName(code) {
  return LANGUAGES.find((language) => language.code === code)?.name || code;
}

function getGenreKey(languageCode, genre) {
  return `${languageCode}::${genre}`;
}

function hasSelectedGenreInLanguage(languageCode) {
  return [...state.selectedGenreGroups.entries()].some(([key, selected]) => key.startsWith(`${languageCode}::`) && selected);
}

function toTitleCase(value) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function clearCompletion() {
  state.lastCreated = [];
}

function parsePlaylistId(value) {
  if (!value) return "";
  const urlMatch = value.match(/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  const uriMatch = value.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  return /^[a-zA-Z0-9]{16,}$/.test(value) ? value : "";
}

function hasUsableToken() {
  return Boolean(state.token?.access_token && Date.now() < state.token.expires_at);
}

function hasSession() {
  return Boolean(state.token?.access_token || state.token?.refresh_token);
}

function isValidSpotifyClientId(value) {
  return /^[a-f0-9]{32}$/i.test((value || "").trim());
}

function getConfiguredClientId() {
  return (CONFIG.spotifyClientId || "").trim();
}

function logout() {
  state.token = null;
  state.profile = null;
  state.tracks = [];
  localStorage.removeItem(TOKEN_KEY);
  showStatus("Signed out.");
  renderAuthState();
  renderGroups();
}

function showStatus(message, type = "") {
  els.statusPanel.textContent = message;
  els.statusPanel.className = `status-panel visible ${type}`.trim();
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateRandomString(length) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return [...randomValues].map((value) => possible[value % possible.length]).join("");
}

async function createCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function svgPlaceholder() {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 42 42'%3E%3Crect width='42' height='42' fill='%23dbe4d8'/%3E%3Cpath d='M13 27c0 3 2 5 5 5s5-2 5-5V13h8v-3H20v17c0 1-1 2-2 2s-2-1-2-2h-3z' fill='%23151617'/%3E%3C/svg%3E";
}
