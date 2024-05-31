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
import { faker } from '@faker-js/faker';


const posts = useState('posts', () => []);
const user = useState('user', () => null);
const content = ref('');
const addFancyPicture = ref(false);

const postNewPost = async () => {
    // Optimistic update
    const randomImage = faker.image.urlPicsumPhotos()

    const newPost = {
        id: Math.random().toString(36).substr(2, 9),
        content: content.value,
        author: { ...user.value },
        created_time: Date.now() / 1000,
        image: addFancyPicture.value ? randomImage : null
    };

    posts.value = [newPost, ...posts.value];

    // Save to server
    try {
        await $fetch('api/posts', {
            method: 'POST',
            body: {
                image_url: addFancyPicture.value ? randomImage : null,
                content: content.value,
                authorId: user.value.id,
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