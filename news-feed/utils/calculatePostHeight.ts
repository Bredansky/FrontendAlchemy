import type { AuthoredPostWithHeight } from "~/features/feed/FeedPost.vue";

function calculateTextHeight(text: string) {
  const lineHeight = 24;
  const maxWidth = 370;
  const fontSize = "16px";

  const container = document.createElement("div");
  container.style.visibility = "hidden";
  container.style.position = "absolute";
  container.style.width = `${maxWidth}px`; // Set the width to maxWidth
  container.style.fontSize = fontSize; // Set font size and family
  container.style.lineHeight = `${lineHeight}px`; // Set line height
  container.style.wordWrap = "break-word"; // Wrap long words
  container.style.whiteSpace = "normal"; // Allow line breaks
  container.textContent = text;

  document.body.appendChild(container);
  const textHeight = container.offsetHeight; // Measure the height of the container
  document.body.removeChild(container);

  return textHeight;
}

function approximateTextHeight(text: string) {
  const lineHeight = 24;
  const maxWidth = 370;
  const fontSize = 16;

  const avgLineLength = Math.floor(maxWidth / (fontSize * 0.6)); // 0.6 is a rough average character width ratio
  const numLines = Math.ceil(text.length / avgLineLength);
  return numLines * lineHeight;
}

export const calculatePostHeight = (post: AuthoredPostWithHeight) => {
  const textHeight = import.meta.server
    ? approximateTextHeight(post.content)
    : calculateTextHeight(post.content);
  let height = post.imageUrl ? 388 : 104;
  height += textHeight;
  return height;
};
