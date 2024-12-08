<template>
  <div
    ref="root"
    :style="rootStyle"
    class="overflow-auto"
  >
    <div
      v-if="!loading"
      ref="viewport"
      :style="viewportStyle"
      :class="containerStyle"
    >
      <div
        :style="spacerStyle"
      >
        <FeedPost
          v-for="post in visibleItems"
          :key="post.id"
          :post="post"
          :root="root"
          @resize="handlePostResize"
        />
      </div>
    </div>
    <div v-else>
      <SkeletonLoader
        v-for="i in 4"
        :key="'loader' + i"
        :class="containerStyle"
      />
    </div>
    <div
      ref="sentinel"
      class="h-px"
    />
  </div>
</template>

<script setup lang="ts">
import type { AuthoredPost } from '~/server/api/posts.get'

const props = defineProps({
  fetchData: {
    type: Function as PropType<(size: number, cursor: string) => Promise<{
      posts: AuthoredPost[]
      cursor: string | null
    }>>,
    required: true,
  },
})

const sentinel = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const root = ref<HTMLElement | null>(null)

const {
  visibleItems,
  loading,
  handlePostResize,
  refreshPosts,
  offsetY,
  rootHeight,
  viewportHeight,
} = useVirtualizedList({
  fetchData: props.fetchData,
  minimalPostHeight: MINIMAL_POST_HEIGHT,
  bufferAmountOfPosts: BUFFER_AMOUNT_OF_POSTS,
  sentinel,
  viewport,
  root,
})

const rootStyle = computed(() => {
  return {
    height: `${rootHeight.value}px`,
  }
})

const viewportStyle = computed(() => ({
  height: `${viewportHeight.value}px`,
}))

const spacerStyle = computed(() => ({
  transform: `translateY(${offsetY.value}px)`,
}))

const containerStyle = 'mx-auto min-w-80 max-w-screen-xl border border-t-0 border-gray-300'

defineExpose({ refreshPosts })
</script>
