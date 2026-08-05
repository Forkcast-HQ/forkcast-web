import { access, readFile, rename, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const apiDirectory = new URL("../app/api", import.meta.url);
const apiStash = new URL("../.api-pages-build", import.meta.url);
const dynamicRoutes = [
  new URL("../app/restaurant/[slug]/page.tsx", import.meta.url),
  new URL("../app/restaurant/[slug]/dish/[id]/page.tsx", import.meta.url),
];
const originalRoutes = await Promise.all(dynamicRoutes.map((route) => readFile(route, "utf8")));
let apiMoved = false;
let buildStatus = 1;

try {
  await access(apiDirectory);
  await rename(apiDirectory, apiStash);
  apiMoved = true;

  await Promise.all(
    dynamicRoutes.map((route, index) =>
      writeFile(
        route,
        originalRoutes[index].replace(
          "export const dynamicParams = true;",
          "export const dynamicParams = false;",
        ),
      ),
    ),
  );

  const result = spawnSync("node_modules/.bin/next", ["build"], {
    stdio: "inherit",
    env: { ...process.env, STATIC_EXPORT: "true" },
  });
  buildStatus = result.status ?? 1;
} finally {
  await Promise.all(dynamicRoutes.map((route, index) => writeFile(route, originalRoutes[index])));
  if (apiMoved) await rename(apiStash, apiDirectory);
}

process.exitCode = buildStatus;
