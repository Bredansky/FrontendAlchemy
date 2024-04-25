<template>
    <div class="post-composer">
        <textarea v-model="content" placeholder="Write your post here"></textarea>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
            <label>
                <input type="checkbox" v-model="addFancyPicture">
                Add fancy picture
            </label>
            <button @click="postNewPost">Post</button>
        </div>
    </div>
</template>

<script setup>

const posts = useState('posts', () => []);
const content = useState('content', () => '');
const addFancyPicture = useState('addFancyPicture', () => false);

const postNewPost = async () => {
    // Optimistic update
    const newPost = {
        id: Math.random().toString(36).substr(2, 9), // Temporary ID
        content: content.value,
        author: { id: 1, name: 'User' }, // Assuming user ID and name are available
        reactions: { likes: 0, haha: 0 },
        created_time: Date.now() / 1000 // Current timestamp
    };
    posts.value = [newPost, ...posts.value];

    // Save to server
    try {
        await $fetch('api/posts', {
            method: 'POST',
            body: {
                addFancyPicture: addFancyPicture.value,
                content: content.value,
                authorId: 1,
            }
        });
        // Data successfully saved
    } catch (error) {
        // Revert changes on error
        posts.value = posts.value.filter(post => post.id !== newPost.id);
        console.error('Error posting new post:', error);
    }

    // Clear input
    content.value = '';
};
</script>


<style scoped>
.post-composer {
    margin-bottom: 20px;
}

textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 10px;
}

button {
    padding: 8px 16px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}
</style>