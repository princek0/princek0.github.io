import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (firstPost, secondPost) =>
      secondPost.data.publishedAt.getTime() -
      firstPost.data.publishedAt.getTime(),
  );
}

export function formatPostDate(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day} ${months[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;
}

export function getPostPath(post: BlogPost): string {
  return `/blog/${getPostSlug(post)}/`;
}

export function getPostSlug(post: BlogPost): string {
  return post.id.replace(/\.(md|mdx)$/i, "");
}
