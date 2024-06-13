<template>
  <div class="feed-post">
    <div class="author-info">
      <img :src="post.author.profilePhotoUrl" alt="Profile Picture" class="profile-picture" />
      <div>
        <p class="author-name">
          {{ post.author.nickname }}
        </p>
        <p class="post-time">
          {{ formatDate(post.createdAt) }}
        </p>
      </div>
    </div>
    <p class="post-text">
      {{ post.content }}
    </p>
    <img v-if="post.imageUrl" :src="post.imageUrl" alt="Post Image" class="post-image" width="500px" />
    <div class="reactions">
      <button @click="toggleReaction('like')" :class="{ active: userReactions.like }">
        👍 {{ post.reactions.likes }}
      </button>
      <button @click="toggleReaction('haha')" :class="{ active: userReactions.haha }">
        😂 {{ post.reactions.hahas }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthoredPost } from '~/server/api/posts.get';


const props = defineProps<{
  post: AuthoredPost;
}>();

const userReactions = ref({
  like: props.post.currentUserReaction.liked,
  haha: props.post.currentUserReaction.hahaed,
});

const user = useState('user', () => ({ id: 4 }));

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // You can specify locale and options here if needed
};

const toggleReaction = async (reactionType: "like" | "haha") => {
  try {
    const isActive = userReactions.value[reactionType];
    const action = isActive ? 'unreact' : 'react';
    const userId = user.value.id; // Replace with actual user ID

    // Optimistically update the UI
    if (reactionType === 'like') {
      props.post.reactions.likes += isActive ? -1 : 1;
      userReactions.value.like = !isActive;
    } else if (reactionType === 'haha') {
      props.post.reactions.hahas += isActive ? -1 : 1;
      userReactions.value.haha = !isActive;
    }

    await $fetch(`/api/posts/${props.post.id}/react`, {
      method: 'PUT',
      body: JSON.stringify({ action, reactionType, userId }),
    });

  } catch (error) {
    console.error(`Error toggling ${reactionType} reaction:`, error);

    // Revert the optimistic update if the API call fails
    if (reactionType === 'like') {
      props.post.reactions.likes += userReactions.value.like ? -1 : 1;
      userReactions.value.like = !userReactions.value.like;
    } else if (reactionType === 'haha') {
      props.post.reactions.hahas += userReactions.value.haha ? -1 : 1;
      userReactions.value.haha = !userReactions.value.haha;
    }
  }
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
