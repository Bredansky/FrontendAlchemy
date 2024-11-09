export const enrichContent = (text: string) => {
  const hashtagPattern = /#(\w+)/g
  const mentionPattern = /@(\w+)/g

  return text
    .replace(
      hashtagPattern,
      '<span class="text-blue-500 font-semibold">#$1</span>',
    )
    .replace(
      mentionPattern,
      '<span class="text-blue-500 font-semibold">@$1</span>',
    )
}
