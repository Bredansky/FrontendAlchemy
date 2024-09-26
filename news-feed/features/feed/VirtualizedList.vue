<template>
  <div ref="root" :style="rootStyle" class="overflow-auto">
    <div
      ref="viewport"
      :style="viewportStyle"
      class="max-w-screen-xl min-w-80 mx-auto border border-gray-300 border-t-0"
    >
      <div ref="spacer" :style="spacerStyle">
        <FeedPost
          v-for="post in visibleItems"
          :key="post.id"
          :post="post"
          :root="root"
          @resize="handleResize"
        />
      </div>
    </div>
    <div v-if="loading">
      <SkeletonLoader v-for="i in 4" :key="'loader' + i" />
    </div>
    <div ref="sentinel" class="h-[1px]"></div>
  </div>
  <div
    v-if="showPrompt"
    class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
  >
    <div class="bg-white p-4 rounded shadow-lg">
      <p class="mb-4">The feed is stale. Do you want to refresh?</p>
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded"
        @click="refreshFeed()"
      >
        Refresh
      </button>
      <button
        class="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded"
        @click="showPrompt = false"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthoredPostWithHeight } from "./FeedPost.vue";

const STALE_FEED_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const showPrompt = ref(false);

const sentinel = ref(null);

const user = useState("user", () => ({ id: 4 }));

const posts = useState<AuthoredPostWithHeight[]>("posts", () => []);

const cursor = useState("cursor", () => "");
const lastFetchTime = useState("lastFetchTime", () => Date.now());

const handleResize = (postId: number) => {
  posts.value = posts.value.map((post) => {
    if (post.id === postId) {
      post.height = calculatePostHeight(post, viewPortWidth.value);
    }
    return post;
  });
};

const checkForStaleFeed = () => {
  const currentTime = Date.now();
  const timeElapsed = currentTime - lastFetchTime.value;

  if (timeElapsed > STALE_FEED_DURATION) {
    // Prompt the user to refresh
    showPrompt.value = true;
  }
};

const fetchData = async (size: number, nextCursor: string) => {
  const res = await $fetch<{
    posts: AuthoredPostWithHeight[];
    pagination: {
      next_cursor: string;
    };
  }>("/api/posts", {
    query: { size, cursor: nextCursor, userId: user.value.id },
  });
  return res;
};

const refreshFeed = async () => {
  posts.value = [];
  cursor.value = "";
  showPrompt.value = false;
  window.scrollTo(0, 0);
  root.value?.scrollTo(0, 0);
  await fetchPosts();
};

const fetchPosts = async () => {
  loading.value = true;
  const data = await fetchData(10, cursor.value || "");

  posts.value = [
    ...posts.value,
    ...data.posts.map((post) => {
      post.height = calculatePostHeight(post, viewPortWidth.value);
      return post;
    }),
  ];
  cursor.value = data.pagination.next_cursor;
  lastFetchTime.value = Date.now();
  loading.value = false;
};

const rootHeight = ref(0);

const scrollTop = useState("scrollTop", () => 0);

const loading = ref(false);

const root = ref<HTMLElement | null>(null);
const viewport = ref<HTMLElement | null>(null);
const viewPortWidth = useState("viewPortWidth", () => 0);
const spacer = ref(null);

const viewportHeight = computed(() => {
  if (posts.value.length === 0) {
    return 0;
  }
  return posts.value.reduce((acc, cur) => {
    return acc + cur.height;
  }, 0);
});

const startIndex = computed(() => {
  let sum = 0;
  let index = 0;

  while (sum < scrollTop.value && index < posts.value.length) {
    const itemHeight = posts.value[index].height;
    sum += itemHeight !== undefined ? itemHeight : 0;
    index++;
  }
  return Math.max(0, index - 1);
});

const visibleNodeCount = computed(() => {
  if (posts.value.length === 0) {
    return 0;
  }
  let count = 1;
  let index = startIndex.value + 1;
  let sum =
    posts.value[startIndex.value].height - (scrollTop.value - offsetY.value);

  while (index < posts.value.length && sum < rootHeight.value) {
    const itemHeight = posts.value[index].height;
    sum += itemHeight !== undefined ? itemHeight : 0;
    count++;
    index++;
  }

  return count;
});

const visibleItems = computed<AuthoredPostWithHeight[]>(() =>
  posts.value.slice(
    startIndex.value,
    startIndex.value + visibleNodeCount.value,
  ),
);

const offsetY = computed(() => {
  // Sum the height of all items before the start index
  return posts.value.slice(0, startIndex.value).reduce((acc, item) => {
    return acc + (item.height || 0); // Ensure height defaults to 0 if undefined
  }, 0);
});

const rootStyle = computed(() => {
  return {
    height: `${rootHeight.value}px`,
  };
});

const viewportStyle = computed(() => ({
  height: `${viewportHeight.value}px`,
}));

const spacerStyle = computed(() => ({
  transform: `translateY(${offsetY.value}px)`,
}));

const handleScroll = () => {
  scrollTop.value = root.value?.scrollTop || 0;
};

const updateRootHeight = () => {
  const vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0,
  );
  //TODO: No magic numbers
  rootHeight.value = vh - (41 + 167);
};

const updatePostsHeight = () => {
  posts.value.map((post) => {
    post.height = calculatePostHeight(post, viewPortWidth.value);
    return post;
  });
};

onMounted(async () => {
  viewPortWidth.value = viewport.value?.offsetWidth || 0;
  fetchPosts();
  updateRootHeight();
  updatePostsHeight();
  window.addEventListener("resize", () => {
    viewPortWidth.value = viewport.value?.offsetWidth || 0;
    updateRootHeight();
    updatePostsHeight();
  });

  if (root.value) {
    root.value.scrollTop = scrollTop.value;
  }

  const doesBrowserSupportPassiveScroll = () => {
    let passiveSupported = false;
    try {
      const options = {
        get passive() {
          passiveSupported = true;
          return false;
        },
      };

      window.addEventListener("test", () => {}, options);
      window.removeEventListener("test", () => {});
    } catch (err) {
      passiveSupported = false;
    }

    return passiveSupported;
  };

  root.value?.addEventListener(
    "scroll",
    handleScroll,
    doesBrowserSupportPassiveScroll() ? { passive: true } : false,
  );

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      console.log(entries);
      if (entries[0].isIntersecting && !loading.value) {
        fetchPosts();
      }
    },
    { threshold: 0.5 },
  );

  if (sentinel.value) {
    intersectionObserver.observe(sentinel.value);
  }

  //TODO: No magic numbers
  setInterval(checkForStaleFeed, 10 * 60 * 1000);
});
</script>
