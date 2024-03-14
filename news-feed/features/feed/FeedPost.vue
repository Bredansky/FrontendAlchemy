<template>
  <div class="feed-post">
    <div class="author-info">
      <img
        :src="post.author.profilePhotoUrl"
        alt="Profile Picture"
        class="profile-picture"
      />
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
    <img
      v-if="post.image"
      :src="post.image"
      alt="Post Image"
      class="post-image"
    />
    <div class="reactions">
      <span class="reaction">Likes: {{ post.reactions.likes }}</span>
      <span class="reaction">Haha: {{ post.reactions.haha }}</span>
      <!-- Add more reactions as needed -->
    </div>
  </div>
</template>

<script setup>
const { post } = defineProps(["post"]);

const formatDate = (timestamp) => {
  // You can implement your own date formatting logic here
  return new Date(timestamp * 1000).toLocaleString(); // Convert seconds to milliseconds
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
</style>
