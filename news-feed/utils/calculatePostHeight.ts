import type { AuthoredPostWithHeight } from "~/features/feed/FeedPost.vue";

function calculateTextHeight(text: string, width: number) {
  const lineHeight = 24;
  const fontSize = 16;

  const container = document.createElement("div");
  container.style.visibility = "hidden";
  container.style.position = "absolute";
  container.style.width = `${width}px`;
  container.style.fontSize = `${fontSize}px`;
  container.style.lineHeight = `${lineHeight}px`;
  container.style.wordWrap = "break-word";
  container.style.whiteSpace = "normal";
  container.textContent = text;

  document.body.appendChild(container);
  const textHeight = container.offsetHeight;
  document.body.removeChild(container);

  return textHeight;
}

export const calculatePostHeight = (
  post: AuthoredPostWithHeight,
  width: number,
) => {
  const textHeight = calculateTextHeight(post.content, width);
  let height = post.imageUrl ? 388 : 104;
  height += textHeight;
  return height;
};
