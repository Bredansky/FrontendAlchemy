<template>
    <div class="feed-list">
        <PostComposer />
        <FeedPost v-for="post in posts" :key="post.id" :post="post" />
        <div ref="sentinel" style="height: 1px" />
    </div>
</template>

<script setup>
const posts = useState('posts', () => []);
const cursor = useState('cursor', () => null);
const sentinel = ref(null);

const fetchData = async (size, nextCursor) => {
    const res = await $fetch("/api/posts", {
        query: { size, cursor: nextCursor },
    });
    return res;
}

const fetchPosts = async () => {
    const data = await fetchData(10, cursor.value || null);
    posts.value = [...posts.value, ...data.posts];
    cursor.value = data.pagination.next_cursor;
}

// Define state for the user
const user = useState('user', () => null);


onMounted(async () => {
    // try {
    //     const response = await $fetch('/api/users/1');
    //     // Update the user state with the fetched user data
    //     user.value = response;
    // } catch (error) {
    //     console.error('Error fetching user:', error);
    // }
    await fetchPosts();
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && cursor.value) {
                fetchPosts();
            }
        },
        { threshold: 0.5 }
    );
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
