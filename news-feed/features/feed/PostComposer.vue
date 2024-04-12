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
const content = ref(null);

let addFancyPicture = ref(false); // Initialize the checkbox state

const postNewPost = async () => {
    await $fetch('api/posts', {
        method: 'POST',
        body: {
            addFancyPicture: addFancyPicture.value,
            content: content.value,
            authorId: 1,
        }
    }).then(res => {
        content.value = '';

    }).catch(error => {
        console.error('Error posting new post:', error);
    })
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