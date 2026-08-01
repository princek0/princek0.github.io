import rss from "@astrojs/rss";

import { getPostPath, getPublishedPosts } from "../lib/posts";

export async function GET(context: { site?: URL }) {
  const posts = await getPublishedPosts();

  return rss({
    title: "Prince's writing",
    description:
      "Prince's writing on technology, science, startups, and education.",
    site: context.site ?? new URL("https://thisisprince.com"),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: getPostPath(post),
      pubDate: post.data.publishedAt,
    })),
    customData: "<language>en-gb</language>",
  });
}
