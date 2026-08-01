import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseHTML } from "linkedom";
import TurndownService from "turndown";

const ROOT_DIRECTORY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const CONTENT_DIRECTORY = path.join(ROOT_DIRECTORY, "src", "content", "blog");
const MEDIA_DIRECTORY = path.join(ROOT_DIRECTORY, "public", "media", "blog");

const POSTS = [
  "dropping-out-of-oxford",
  "thoughts-on-being-pro-defence-and-national-security-pilled",
  "checking-out-models-fine-tuning-to-suggest-chessgpts-understanding",
  "the-potential-for-mirror-bacteria-to-cause-unprecedented-and-irreversible-harm",
  "3-takeaways-from-3-months-at-ef-as-a-talent-investor",
  "reflections-on-an-ai-security-hackathon-we-ran",
  "takeaways-from-how-to-be-a-founder",
  "applying-stochastic-gradient-descent",
  "7-steps-to-build-a-horse-classifier-with-fastai",
];

const IMAGE_ALT_TEXT = {
  "thoughts-on-being-pro-defence-and-national-security-pilled": [
    "Orange technical line drawings of an F-22 Raptor from four angles on a dark background.",
    "Orange technical line drawings of a C-RAM air-defence system from four angles on a dark background.",
  ],
};

function createTurndownService() {
  const service = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    headingStyle: "atx",
    strongDelimiter: "**",
  });

  service.addRule("mathml", {
    filter: (node) => node.nodeName === "MATH",
    replacement: (_content, node) => {
      const serializedMath = node.outerHTML;
      return node.getAttribute("display") === "block"
        ? `\n\n${serializedMath}\n\n`
        : serializedMath;
    },
  });

  service.addRule("python-code-block", {
    filter: (node) => node.nodeName === "PRE",
    replacement: (_content, node) => {
      const code = node.textContent.replace(/\n+$/, "");
      return `\n\n\`\`\`python\n${code}\n\`\`\`\n\n`;
    },
  });

  return service;
}

function replaceHeading(document, heading, tagName) {
  const replacement = document.createElement(tagName);
  replacement.innerHTML = heading.innerHTML;
  heading.replaceWith(replacement);
}

function normalizeHeadingStructure(document, content, slug) {
  content
    .querySelectorAll("h1")
    .forEach((heading) => replaceHeading(document, heading, "h2"));

  if (slug === "dropping-out-of-oxford") {
    content
      .querySelectorAll("h3")
      .forEach((heading) => replaceHeading(document, heading, "h2"));
  }

  if (slug === "reflections-on-an-ai-security-hackathon-we-ran") {
    content.querySelectorAll("h4").forEach((heading) => {
      const replacement = document.createElement("p");
      const emphasis = document.createElement("em");
      emphasis.innerHTML = heading.innerHTML;
      replacement.append(emphasis);
      heading.replaceWith(replacement);
    });
  }
}

function removeBearChrome(content) {
  content.querySelector("h1")?.remove();

  const publishedTime = content.querySelector("time");
  const dateContainer = publishedTime?.closest("p");
  if (dateContainer) {
    dateContainer.remove();
  } else {
    publishedTime?.remove();
  }

  content
    .querySelectorAll(
      "script, style, #upvote-form, .upvote-button, .upvote-count",
    )
    .forEach((element) => element.remove());
}

async function downloadImages(content, slug) {
  const images = [...content.querySelectorAll("img")];
  if (images.length === 0) {
    return undefined;
  }

  const destinationDirectory = path.join(MEDIA_DIRECTORY, slug);
  await mkdir(destinationDirectory, { recursive: true });

  for (const [index, image] of images.entries()) {
    const sourceUrl = new URL(image.getAttribute("src"));
    const sourceExtension = path.extname(sourceUrl.pathname).toLowerCase();
    const safeExtension = [".gif", ".jpeg", ".jpg", ".png", ".webp"].includes(
      sourceExtension,
    )
      ? sourceExtension
      : ".jpg";
    const fileName = `image-${index + 1}${safeExtension}`;
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      throw new Error(
        `Unable to download ${sourceUrl}: ${response.status} ${response.statusText}`,
      );
    }

    await writeFile(
      path.join(destinationDirectory, fileName),
      Buffer.from(await response.arrayBuffer()),
    );

    image.setAttribute("src", `/media/blog/${slug}/${fileName}`);
    if (!image.getAttribute("alt")?.trim()) {
      image.setAttribute(
        "alt",
        IMAGE_ALT_TEXT[slug]?.[index] ??
          "Illustration accompanying the article.",
      );
    }
    image.removeAttribute("loading");
  }

  return `/media/blog/${slug}/${path.basename(images[0].getAttribute("src"))}`;
}

function buildFrontmatter({
  description,
  legacyBearUrl,
  publishedAt,
  socialImage,
  title,
}) {
  const fields = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `publishedAt: ${JSON.stringify(publishedAt)}`,
    "draft: false",
    `legacyBearUrl: ${JSON.stringify(legacyBearUrl)}`,
  ];

  if (socialImage) {
    fields.push(`socialImage: ${JSON.stringify(socialImage)}`);
  }

  fields.push("---", "");
  return fields.join("\n");
}

async function importPost(slug) {
  const legacyBearUrl = `https://thisisprince.bearblog.dev/${slug}/`;
  const response = await fetch(legacyBearUrl);

  if (!response.ok) {
    throw new Error(
      `Unable to fetch ${legacyBearUrl}: ${response.status} ${response.statusText}`,
    );
  }

  const { document } = parseHTML(await response.text());
  const sourceMain = document.querySelector("main");
  const title = sourceMain
    ?.querySelector("h1")
    ?.textContent.replace(/\s+/g, " ")
    .trim();
  const publishedAt = sourceMain
    ?.querySelector("time")
    ?.getAttribute("datetime");
  const description = document
    .querySelector('meta[name="description"]')
    ?.getAttribute("content")
    ?.replace(/\s+/g, " ")
    ?.trim();

  if (!sourceMain || !title || !publishedAt || !description) {
    throw new Error(`Missing required content in ${legacyBearUrl}`);
  }

  const content = sourceMain.cloneNode(true);
  removeBearChrome(content);
  normalizeHeadingStructure(document, content, slug);
  const socialImage = await downloadImages(content, slug);

  const markdown = createTurndownService()
    .turndown(content)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const output = `${buildFrontmatter({
    description,
    legacyBearUrl,
    publishedAt,
    socialImage,
    title,
  })}${markdown}\n`;

  await writeFile(path.join(CONTENT_DIRECTORY, `${slug}.md`), output, "utf8");

  return {
    headings: content.querySelectorAll("h2, h3").length,
    images: content.querySelectorAll("img").length,
    paragraphs: content.querySelectorAll("p").length,
    slug,
  };
}

await mkdir(CONTENT_DIRECTORY, { recursive: true });
await mkdir(MEDIA_DIRECTORY, { recursive: true });

const report = [];
for (const slug of POSTS) {
  report.push(await importPost(slug));
}

console.log(JSON.stringify(report, null, 2));
