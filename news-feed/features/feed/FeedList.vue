<template>
  <div class="feed-list">
    <FeedPost v-for="post in posts" :key="post.id" :post="post" />
    <div ref="sentinel" style="height: 1px" />
  </div>
</template>

<script setup>
const posts = ref([]);
const cursor = ref(null);
const sentinel = ref(null);

const { data } = await useFetch("/api/posts", {
  query: { size: 10 },
});

posts.value = [...posts.value, ...data.value.posts];
cursor.value = data.value.pagination.next_cursor;

async function fetchPosts(size, nextCursor) {
  $fetch("/api/posts", {
    query: { size, cursor: nextCursor },
  }).then((res) => {
    posts.value = [...posts.value, ...res.posts];
    cursor.value = res.pagination.next_cursor;
  });
}

onMounted(() => {
  // Initialize IntersectionObserver
  const observer = new IntersectionObserver(
    (entries) => {
      // When the sentinel element is intersecting with the viewport, fetch more posts
      if (entries[0].isIntersecting && cursor.value) {
        fetchPosts("10", cursor.value);
      }
    },
    { threshold: 0.5 }, // Define the threshold for intersection
  );

  // Observe the sentinel element
  observer.observe(sentinel.value);
});
</script>

<style scoped>
.feed-list {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>
