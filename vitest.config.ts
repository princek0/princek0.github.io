/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// getViteConfig resolves Astro virtual modules such as astro:env/server so the
// likes helpers can be unit tested outside the dev server.
export default getViteConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
