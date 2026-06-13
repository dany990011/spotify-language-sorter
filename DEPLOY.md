# Deploying to Vercel

This app can be deployed as a static Vercel site.

## 1. Spotify Developer Dashboard

Create or open your Spotify app and add these redirect URIs:

```text
http://127.0.0.1:5173/
https://your-project-name.vercel.app/
```

After the first Vercel deploy, replace `https://your-project-name.vercel.app/` with the real production URL Vercel gives you. The redirect URI must match exactly, including the trailing slash.

## 2. Vercel project settings

When importing the project into Vercel:

```text
Root Directory: outputs/spotify-language-sorter
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Add this environment variable in Vercel:

```text
SPOTIFY_CLIENT_ID=your_32_character_spotify_client_id
```

The Client ID is not a secret, but using an environment variable keeps deployment config separate from source files.

## 3. Deploy flow

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Set `SPOTIFY_CLIENT_ID`.
4. Deploy.
5. Add the final Vercel production URL as a Spotify redirect URI.
6. Redeploy if needed, then test Connect.

If Vercel shows `FUNCTION_INVOCATION_FAILED`, the deployment is probably running server code instead of serving `dist`. Check that the project root is this folder, the framework preset is `Other`, and the output directory is `dist`.

## Important Spotify limit

Vercel can host the app, but Spotify still controls who can authorize it. In Spotify development mode, only allowlisted users can use it. For unlimited public users, Spotify requires extended quota mode.
