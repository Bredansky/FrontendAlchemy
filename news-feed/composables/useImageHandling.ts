import type { AuthoredPostWithHeight } from '~/features/feed/FeedPost.vue'

export function useImageHandling(post: AuthoredPostWithHeight, root: HTMLElement | null, image: Ref<HTMLElement | null>) {
  const imageSrc = ref('')
  const imageLoaded = ref(false)
  const lowResImageUrl = generateLowResImageUrl(post.imageUrl || '')
  const srcset = generateSrcset(post.imageUrl || '')
  const isFastConnection = useFastConnection()

  const handleVisibilityChange = (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver,
  ) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (isFastConnection) {
          imageSrc.value = post.imageUrl || ''
        }
        observer.unobserve(entry.target)
      }
    })
  }

  const loadHighResImage = () => {
    imageSrc.value = post.imageUrl || ''
    imageLoaded.value = true
  }

  onMounted(() => {
    if (isFastConnection && root) { // Accessing the value of the ref
      const observer = new IntersectionObserver(handleVisibilityChange, {
        root: root, // Accessing the actual DOM element
        rootMargin: '500px', // Pre-fetch the image
      })

      if (image.value) {
        observer.observe(image.value)
      }
    }
  })

  return {
    imageSrc,
    imageLoaded,
    lowResImageUrl,
    loadHighResImage,
    srcset,
  }
}

function generateLowResImageUrl(url: string) {
  if (!url) return ''
  const urlParts = url.split('/')
  const lowResWidth = '80'
  const lowResHeight = '45'
  urlParts[urlParts.length - 2] = lowResWidth
  urlParts[urlParts.length - 1] = lowResHeight
  return urlParts.join('/') + '?blur=3'
}

const generateSrcset = (url: string) => {
  return `
      ${generateImageUrl(url, 320, 180)} 320w,
      ${generateImageUrl(url, 640, 360)} 640w,
      ${generateImageUrl(url, 768, 432)} 768w,
      ${generateImageUrl(url, 1024, 576)} 1024w,
      ${generateImageUrl(url, 1280, 720)} 1280w
    `
}

const generateImageUrl = (url: string, width: number, height: number) => {
  if (!url) return ''

  const urlParts = url.split('/')

  urlParts[urlParts.length - 2] = width.toString()
  urlParts[urlParts.length - 1] = height.toString()

  return urlParts.join('/') + '.webp'
}
