<template>
    <div ref="listContainer" class="custom-virtual-list" @scroll="handleScroll">
        <div v-for="item in visibleItemsWithPlaceholders" :key="item.id" :style="{ height: item.height + 'px' }">
            <div v-if="item.isPlaceholder" class="placeholder"></div>
            <div v-else>
                <FeedPost :post="item" />
            </div>
        </div>
        <div ref="sentinel" class="sentinel"></div>
    </div>
</template>

<script setup>
const listContainer = ref(null);
const sentinel = ref(null);
const user = useState('user', () => null);


user.value = await $fetch('/api/users/4').then(result => result.user);

const state = reactive({
    posts: [],
    startIndex: 0,
    endIndex: 10,
    totalHeight: 0,
    nextCursor: null,
    size: 10,
});

const fetchPosts = async () => {
    try {
        const response = await $fetch("/api/posts", {
            query: { size: state.size, cursor: state.nextCursor, userId: user.value.id },
        });

        if (response.posts && response.posts.length > 0) {
            state.posts.push(...response.posts);
            state.nextCursor = response.pagination.next_cursor;
        } else {
            state.nextCursor = null; // No more items to load
        }
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        state.nextCursor = null; // Stop further fetching on error
    }
};

const visibleItemsWithPlaceholders = computed(() => {
    const items = [];
    let accumulatedHeight = 0;

    for (let i = 0; i < state.posts.length; i++) {
        const height = calculateItemHeight(state.posts[i]);
        if (i >= state.startIndex && i < state.endIndex) {
            items.push({ ...state.posts[i], height });
        } else {
            items.push({ id: `placeholder-${i}`, isPlaceholder: true, height });
        }
        accumulatedHeight += height;
    }

    state.totalHeight = accumulatedHeight;
    console.log(items)
    return items;
});

const handleScroll = () => {
    const container = listContainer.value;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const visibleHeight = container.clientHeight;

    // Calculate the visible area boundaries
    const startBoundary = scrollTop;
    const endBoundary = scrollTop + visibleHeight;

    // Determine the start index based on the start boundary
    let accumulatedHeight = 0;
    let start = 0;

    for (let i = 0; i < state.posts.length; i++) {
        const itemHeight = calculateItemHeight(state.posts[i]);
        if (accumulatedHeight + itemHeight >= startBoundary) {
            start = i;
            break;
        }
        accumulatedHeight += itemHeight;
    }

    // Determine the end index based on the end boundary
    accumulatedHeight = 0;
    let end = state.posts.length;

    for (let i = start; i < state.posts.length; i++) {
        const itemHeight = calculateItemHeight(state.posts[i]);
        accumulatedHeight += itemHeight;
        if (accumulatedHeight >= endBoundary) {
            end = i + 1;
            break;
        }
    }

    state.startIndex = start;
    state.endIndex = end;
};

const calculateItemHeight = (item) => {
    return 600;
    const baseHeight = 50; // Example base height for item
    const lines = item.content ? item.content.split(' ').length / 5 : 0; // Example: 5 words per line
    const imageHeight = item.imageUrl ? 150 : 0; // Example height if image is present
    return baseHeight + lines * 20 + imageHeight; // Adjust the height calculation based on your content
};

const loadMoreItems = async () => {
    await fetchPosts();
    // No more items to fetch
    // if (!state.nextCursor) {
    //     if (observer.value) {
    //         observer.value.disconnect();
    //     }
    // }
};

onMounted(async () => {
    await loadMoreItems();

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && state.nextCursor) {
                fetchPosts();
            }
        },
        { threshold: 0.5 }
    );
    observer.observe(sentinel.value);

    handleScroll();
});

watch(
    () => state.posts.length,
    () => {
        handleScroll();
    }
);

// onBeforeUnmount(() => {
//     if (observer.value) {
//         observer.value.disconnect();
//     }
// });
</script>

<style scoped>
.custom-virtual-list {
    height: 600px;
    /* Example height for the virtualized list */
    overflow-y: auto;
    /* Enable scroll for virtualization */
    position: relative;
    /* Position relative for scroll offset */
}

.placeholder {
    border: 1px dashed #ccc;
    /* Example dashed border */
    margin-bottom: 10px;
    /* Adjust margin to maintain spacing */
}

.sentinel {
    height: 1px;
    /* Sentinel height for IntersectionObserver */
}
</style>