/**
 * The bridge between the `@/` alias from tsconfig.json and `node --test`.
 *
 * Tests run on bare Node (since 24 it strips type annotations from .ts files itself), so
 * there is no bundler here to resolve `@/lib/...`. This hook does one thing: it turns
 * `@/x` into a path to `src/x` and appends `.ts` when an import has no extension. Thanks
 * to it the tests import exactly the same modules the application sees — without mirrored
 * copies of paths and without a new dependency in package.json.
 *
 * Registered by `npm test` (see package.json).
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const SRC = pathToFileURL(new URL("../src/", import.meta.url).pathname).href;

register(
  `data:text/javascript,
   const SRC = ${JSON.stringify(SRC)};
   export async function resolve(specifier, context, nextResolve) {
     if (specifier.startsWith("@/")) {
       const path = SRC + specifier.slice(2);
       const withExt = /\\.[a-z]+$/.test(path) ? path : path + ".ts";
       return nextResolve(withExt, context);
     }
     return nextResolve(specifier, context);
   }`,
  import.meta.url,
);
