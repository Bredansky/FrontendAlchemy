import type { AuthoredPost } from '~/server/api/posts.get'

// TODO: Reuse those in actual styles
const reactionsHeight = 28
const headerHeight = 48
const borderWidth = 1
const gapHeight = 4

function calculateTextHeight(text: string, width: number) {
  const lineHeight = 24
  const fontSize = 16

  const container = document.createElement('div')
  container.style.visibility = 'hidden'
  container.style.position = 'absolute'
  container.style.width = `${width}px`
  container.style.fontSize = `${fontSize}px`
  container.style.lineHeight = `${lineHeight}px`
  container.style.wordWrap = 'break-word'
  container.style.whiteSpace = 'normal'
  const displayText = document.createElement('p')
  displayText.textContent = text
  container.appendChild(displayText)

  // TODO: No magick NUMBER
  if (text.length > 300) {
    displayText.textContent = text.substring(0, 300).trim() + '...'
    const seeMoreText = document.createElement('p')
    seeMoreText.style.marginTop = `${gapHeight}px`
    seeMoreText.textContent = 'See more'
    container.appendChild(seeMoreText)
  }

  document.body.appendChild(container)
  const textHeight = container.offsetHeight
  document.body.removeChild(container)

  return textHeight
}

export const calculatePostHeight = (
  post: AuthoredPost,
  width: number,
) => {
  const textHeight = calculateTextHeight(post.content, width) + gapHeight
  const imageHeight = post.imageUrl
    ? (width - borderWidth * 2) * (9 / 16) + gapHeight
    : 0

  const height
    = headerHeight
    + textHeight
    + imageHeight
    + gapHeight
    + reactionsHeight
    + borderWidth
  return height
}
