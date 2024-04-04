<template>
    <div class="post-composer">
        <textarea v-model="content" placeholder="Write your post here"></textarea>
        <input type="file" @change="handleFileUpload">
        <button @click="postNewPost">Post</button>
    </div>
</template>
  
<script setup>

const content = ref('');
let image = null;

const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        image = files[0];
    }
};

const postNewPost = async () => {
    try {

        const response = await $fetch('api/posts', {
            method: 'POST', body: {
                image_url: image,
                content: content.value,
                authorId: 1,
            }
        });

        // Update the post state with the newly added post
        const newPost = response.data; // Assuming the response contains the newly added post
        // Add logic to update the post state with the new post

        // Reset content and image after successful post
        content.value = '';
        image = null;
    } catch (error) {
        console.error('Error posting new post:', error);
        // Handle error, show error message to user, etc.
    }
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
  