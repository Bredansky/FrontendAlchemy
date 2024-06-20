<template>
  <div ref="root" class="root" :style="rootStyle">
    <div ref="viewport" class="viewport" :style="viewportStyle">
      <div ref="spacer" class="spacer" :style="spacerStyle">
        <div v-for="item in visibleItems" :key="item">
          {{ item }}
        </div>
      </div>
    </div>
    <div ref="sentinel" class="sentinel"></div>
    <!-- Sentinel element -->

    <div v-show="loading" class="loading">Loading...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const sentinel = ref(null); // Define sentinel ref

const items = ref(
  new Array(50).fill(null).map((item, index) => `Item ${index + 1}`),
);
const rootHeight = 400;
const rowHeight = ref(30);
const scrollTop = ref(0);
const nodePadding = 0;
const loading = ref(false);

const root = ref(null); // Define root ref
const viewport = ref(null); // Define viewport ref
const spacer = ref(null); // Define spacer ref

const viewportHeight = computed(() => itemCount.value * rowHeight.value);
const itemCount = computed(() => items.value.length);
const startIndex = computed(
  () => Math.floor(scrollTop.value / rowHeight.value) - nodePadding,
);
const visibleNodeCount = computed(
  () => Math.ceil(rootHeight / rowHeight.value) + 2 * nodePadding,
);
const visibleItems = computed(() =>
  items.value.slice(
    startIndex.value,
    startIndex.value + visibleNodeCount.value,
  ),
);
const offsetY = computed(() => startIndex.value * rowHeight.value);

const rootStyle = computed(() => ({
  height: `${rootHeight}px`,
  overflow: "auto",
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
  loading.value = true;
  setTimeout(() => {
    const newItems = [];
    for (let i = 1; i <= 50; i++) {
      newItems.push(`Item ${items.value.length + i}`);
    }
    items.value = [...items.value, ...newItems];
    loading.value = false;
  }, 1000); // Simulating async load
};

const handleScroll = () => {
  //   const bottomOfWindow =
  //     root.value.scrollTop + root.value.offsetHeight === root.value.scrollHeight;
  //   if (bottomOfWindow && !loading.value) {
  //     loadMore();
  //   }
  scrollTop.value = root.value.scrollTop;
};

onMounted(() => {
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

  const largestHeight = calculateInitialRowHeight();
  rowHeight.value = largestHeight || 30; // Default to 30 if no items are rendered initially
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

const calculateInitialRowHeight = () => {
  const children = spacer.value.children;
  let largestHeight = 0;
  for (let i = 0; i < children.length; i++) {
    if (children[i].offsetHeight > largestHeight) {
      largestHeight = children[i].offsetHeight;
    }
  }
  return largestHeight;
};
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
