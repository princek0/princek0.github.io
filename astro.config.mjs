import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import { defineConfig, envField } from "astro/config";

const serverSecret = envField.string({
  context: "server",
  access: "secret",
  // Optional so builds and deploy previews without credentials still succeed;
  // the likes endpoint reports its own configuration error at runtime.
  optional: true,
});

export default defineConfig({
  site: "https://thisisprince.com",
  output: "static",
  adapter: netlify(),
  integrations: [sitemap()],
  env: {
    schema: {
      SUPABASE_URL: serverSecret,
      SUPABASE_SECRET_KEY: serverSecret,
      LIKE_COOKIE_SECRET: serverSecret,
    },
  },
  markdown: {
    syntaxHighlight: false,
  },
  trailingSlash: "always",
});
