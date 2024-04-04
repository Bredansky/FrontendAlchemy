<template>
  <div class="feed-post">
    <div class="author-info">
      <img :src="post.author.profilePhotoUrl" alt="Profile Picture" class="profile-picture" />
      <div>
        <p class="author-name">
          {{ post.author.nickname }}
        </p>
        <p class="post-time">
          {{ formatDate(post.created_time) }}
        </p>
      </div>
    </div>
    <p class="post-text">
      {{ post.content }}
    </p>
    <img v-if="post.image" :src="post.image" alt="Post Image" class="post-image" />
    <div class="reactions">
      <button @click="toggleLike" :class="{ active: liked }">
        👍 {{ post.reactions.likes }}
      </button>
      <button @click="toggleHaha" :class="{ active: reactedHaha }">
        😂 {{ post.reactions.haha }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { post } = defineProps(["post"]);

const formatDate = (timestamp) => {
  // You can implement your own date formatting logic here
  return new Date(timestamp * 1000).toLocaleString(); // Convert seconds to milliseconds
};


const liked = ref(false);
const reactedHaha = ref(false);

const toggleLike = async () => {
  if (liked.value) {
    // await api.unlikePost(post.id);
    post.reactions.likes--
  } else {
    // await api.likePost(post.id);
    post.reactions.likes++
  }
  liked.value = !liked.value;
};

const toggleHaha = async () => {
  if (reactedHaha.value) {
    // await api.removeHahaReaction(post.id);
    post.reactions.haha--
  } else {
    post.reactions.haha++
    // await api.addHahaReaction(post.id);
  }
  reactedHaha.value = !reactedHaha.value;
};
</script>

<style scoped>
.feed-post {
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 15px;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.profile-picture {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.author-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.post-time {
  color: #888;
  font-size: 12px;
}

.post-text {
  margin-bottom: 10px;
}

.post-image {
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 10px;
}

.reactions {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #555;
}

.reaction {
  margin-right: 10px;
}

.reactions button {
  font-size: 16px;
  margin-right: 10px;
}

.reactions button.active {
  background-color: #007bff;
}

.reactions .active {
  font-weight: bold;
}
</style>
