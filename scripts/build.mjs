import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const clientId = (process.env.SPOTIFY_CLIENT_ID || "").trim();
const sourceConfigPath = path.join(root, "config.js");
const filesToCopy = ["index.html", "styles.css", "app.js", "README.md"];

await rm(dist, { force: true, recursive: true });
await mkdir(dist, { recursive: true });

for (const file of filesToCopy) {
  const source = path.join(root, file);
  const destination = path.join(dist, file);
  await writeFile(destination, await readFile(source));
}

if (clientId) {
  if (!/^[a-f0-9]{32}$/i.test(clientId)) {
    throw new Error("SPOTIFY_CLIENT_ID must be a 32-character Spotify app Client ID.");
  }

  await writeFile(
    path.join(dist, "config.js"),
    `window.SONG_LANGUAGE_SORTER_CONFIG = {\n  spotifyClientId: ${JSON.stringify(clientId)},\n};\n`,
  );
} else {
  await writeFile(path.join(dist, "config.js"), await readFile(sourceConfigPath));
}
