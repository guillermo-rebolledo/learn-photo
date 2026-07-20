import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, join, relative, resolve } from "node:path";

const root = resolve("out");
const port = Number(process.env.LEARN_PHOTO_PORT ?? 4173);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

async function findStaticFile(pathname) {
  const relativePath = pathname.replace(/^\/+/, "");
  const candidates = relativePath
    ? [relativePath, `${relativePath}.html`, join(relativePath, "index.html")]
    : ["index.html"];

  for (const candidate of candidates) {
    const file = resolve(root, candidate);
    const pathFromRoot = relative(root, file);
    if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) continue;
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {}
  }
  return null;
}

createServer(async (request, response) => {
  let pathname = "/";
  try {
    pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  } catch {}

  const file = await findStaticFile(pathname);
  if (!file) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const extension = extname(file);
  response.writeHead(200, {
    "content-type": contentTypes[extension] ?? "application/octet-stream",
    "cache-control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`Learn Photo static export listening on http://127.0.0.1:${port}\n`);
});
