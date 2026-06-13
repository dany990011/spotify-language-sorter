# Song Language Sorter

A local browser app that connects to Spotify, loads either your liked songs or a playlist, groups tracks by inferred language, lets you correct and select groups, then creates new Spotify playlists.

Each language group can also be split into genre playlists. Genre splitting uses Spotify artist genre metadata, so tracks with artists that do not expose genres are grouped as `Uncategorized`.

## Run locally

From this folder:

```powershell
node server.mjs
```

Open:

```text
http://127.0.0.1:5173/
```

## Build for hosting

```powershell
npm run build
```

The deployable static site is written to `dist/`.

## Spotify app setup

Only the app owner does this. End users should not need the Spotify Developer Dashboard.

1. Create an app in the Spotify Developer Dashboard.
2. Add the local redirect URI for development:

```text
http://127.0.0.1:5173/
```

3. If you deploy the app, also add your deployed redirect URI, for example:

```text
https://your-domain.example/
```

4. Copy the app's Client ID into `config.js`:

```js
window.SONG_LANGUAGE_SORTER_CONFIG = {
  spotifyClientId: "your_32_character_client_id_here",
};
```

The app uses Spotify Authorization Code with PKCE, so it does not need a client secret.

## Sharing with users

For a small test, Spotify development mode only allows users you add to the app allowlist. For a public app that can be used by anyone, the Spotify app must be accepted into extended quota mode. The code is already structured so users only click Connect once your Client ID is configured.

## Deploying

See `DEPLOY.md` for Vercel setup.

## Notes

Spotify's Web API does not provide a direct language field for tracks. This app infers language from the song title, artist, and album metadata, then makes you review the result before writing anything to Spotify. For production-level accuracy, add a licensed lyrics metadata provider or your own manually curated language database behind the detection step.

Spotify also does not provide a direct per-track genre field. Genre subdivision is based on the first available genre from the track's listed artists.

By default, the biggest language group is treated as the main language and is not selected for playlist creation. Groups below the minimum song threshold are also left unchecked.
