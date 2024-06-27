<template>
  <div ref="root" class="root" :style="rootStyle">
    <div ref="viewport" class="viewport" :style="viewportStyle">
      <div ref="spacer" class="spacer" :style="spacerStyle">
        <FeedPost v-for="post in visibleItems" :key="post.id" :post="post" />
      </div>
    </div>
    <div ref="sentinel" class="sentinel"></div>
    <!-- Sentinel element -->

    <div v-show="loading" class="loading">Loading...</div>
  </div>
</template>

<script setup>
const sentinel = ref(null); // Define sentinel ref

// const items = ref(
//   new Array(50).fill(null).map((item, index) => `Item ${index + 1}`),
// );

const items = useState("items", () => []);
const cursor = useState("cursor", () => null);

const fetchData = async (size, nextCursor) => {
  const res = await $fetch("/api/posts", {
    query: { size, cursor: nextCursor, userId: user.value.id },
  });
  return res;
};

const fetchPosts = async () => {
  const data = await fetchData(10, cursor.value || null);
  items.value = [
    ...items.value,
    ...data.posts.map((post) => {
      post.height = post.imageUrl ? 380 : 104;
      return post;
    }),
  ];
  cursor.value = data.pagination.next_cursor;
  loading.value = false;
};

const user = useState("user", () => null);
user.value = await $fetch("/api/users/4").then((result) => result.user);

const rootHeight = 608;
const scrollTop = ref(0);
const nodePadding = 0;
const loading = ref(false);

const root = ref(null); // Define root ref
const viewport = ref(null); // Define viewport ref
const spacer = ref(null); // Define spacer ref

const viewportHeight = computed(() => {
  if (items.value.length === 0) {
    return 0;
  }
  return items.value.reduce((acc, cur) => {
    return acc + cur.height;
  }, 0);
});

const startIndex = computed(() => {
  let sum = 0;
  let index = 0;

  while (sum < scrollTop.value && index < items.value.length) {
    const itemHeight = items.value[index].height;
    sum += itemHeight !== undefined ? itemHeight : 0; // Use 0 if height is not yet measured
    index++;
  }

  console.log("startIndex", Math.max(0, index - 1));

  return Math.max(0, index - 1);
});

const visibleNodeCount = computed(() => {
  if (items.value.length === 0) {
    return 0;
  }
  console.log("triggered");
  let count = 1;
  let index = startIndex.value + 1;
  let sum =
    items.value[startIndex.value].height - (scrollTop.value - offsetY.value);

  while (index < items.value.length && sum < rootHeight) {
    const itemHeight = items.value[index].height;
    console.log(items.value[index]);
    sum += itemHeight !== undefined ? itemHeight : 0;
    count++;
    index++;
    console.log("sum", sum, "count", count, "index", index);
  }

  console.log("visibleNodeCount", count);
  console.log(
    "scrollTop.value",
    scrollTop.value,
    "offsetY.value",
    offsetY.value,
  );
  return count;
});

const visibleItems = computed(() =>
  items.value.slice(
    startIndex.value,
    startIndex.value + visibleNodeCount.value,
  ),
);

const offsetY = computed(() => {
  // Sum the height of all items before the start index
  return items.value.slice(0, startIndex.value).reduce((acc, item) => {
    return acc + (item.height || 0); // Ensure height defaults to 0 if undefined
  }, 0);
});

const rootStyle = computed(() => ({
  height: `${rootHeight}px`,
  overflow: "auto",
  borderStyle: "dashed",
  borderWidth: "1px",
}));

const viewportStyle = computed(() => ({
  overflow: "hidden",
  height: `${viewportHeight.value}px`,
  position: "relative",
}));

const spacerStyle = computed(() => ({
  transform: `translateY(${offsetY.value}px)`,
}));

const loadMore = () => {
  console.log("wtf");
  loading.value = true;
  fetchPosts();
};

const handleScroll = () => {
  //   const bottomOfWindow =
  //     root.value.scrollTop + root.value.offsetHeight === root.value.scrollHeight;
  //   if (bottomOfWindow && !loading.value) {
  //     loadMore();
  //   }
  scrollTop.value = root.value.scrollTop;
};

onMounted(async () => {
  await fetchPosts();
  const doesBrowserSupportPassiveScroll = () => {
    let passiveSupported = false;

    try {
      const options = {
        get passive() {
          passiveSupported = true;
          return false;
        },
      };

      window.addEventListener("test", null, options);
      window.removeEventListener("test", null, options);
    } catch (err) {
      passiveSupported = false;
    }

    return passiveSupported;
  };

  root.value.addEventListener(
    "scroll",
    handleScroll,
    doesBrowserSupportPassiveScroll() ? { passive: true } : false,
  );

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      console.log("helwwow", entries[0].isIntersecting);

      if (entries[0].isIntersecting && !loading.value) {
        loadMore();
      }
    },
    { threshold: 0.5 },
  );

  intersectionObserver.observe(sentinel.value);
});

onUnmounted(() => {
  root.value.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
}

body {
  font-family: "Noto Sans", "Tahoma", sans-serif;
  display: flex;
  flex-direction: column;
  color: rgba(0, 0, 0, 0.6);
  padding: 1.25rem;
}

.root {
  height: 100%;
  overflow: auto;
}

.viewport {
  background: #fefefe;
  overflow-y: auto;
}

.spacer > div {
  padding: 0.5rem 0rem;
  border: 1px solid #f5f5f5;
}

.loading {
  background: yellow;
  text-align: center;
  padding: 0.5rem;
}

.sentiel {
  height: 1px;
}
</style>
