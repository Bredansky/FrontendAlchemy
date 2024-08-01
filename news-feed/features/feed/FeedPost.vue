<template>
  <div
    class="py-2 border border-gray-300 rounded-lg"
    :style="{ height: post.height + 'px' }"
  >
    <div class="flex items-center mb-2">
      <NuxtImg
        :src="post.author.profilePhotoUrl"
        alt="Profile Picture"
        class="w-12 h-12 rounded-full mr-4"
      />
      <div>
        <p class="font-semibold mb-1">{{ post.author.nickname }}</p>
        <p class="text-gray-500 text-sm">{{ formatDate(post.createdAt) }}</p>
      </div>
    </div>
    <p class="mb-2" v-html="enrichedContent"></p>
    <img
      v-if="post.imageUrl"
      :src="post.imageUrl"
      width="357px"
      height="268px"
      alt="Post Image"
      class="max-w-full rounded-lg mb-2"
    />
    <div class="flex justify-between text-gray-700 text-sm">
      <button
        :class="{
          'bg-blue-500 text-white font-semibold': userReactions.like,
          'bg-gray-200 text-gray-700': !userReactions.like,
        }"
        class="px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        @click="toggleReaction('like')"
      >
        👍 {{ post.reactions.likes }}
      </button>
      <button
        :class="{
          'bg-blue-500 text-white font-semibold': userReactions.haha,
          'bg-gray-200 text-gray-700': !userReactions.haha,
        }"
        class="px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        @click="toggleReaction('haha')"
      >
        😂 {{ post.reactions.hahas }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthoredPost } from "~/server/api/posts.get";
import { ref, computed } from "vue";

const props = defineProps<{
  post: AuthoredPost;
}>();

const userReactions = ref({
  like: props.post.currentUserReaction.liked,
  haha: props.post.currentUserReaction.hahaed,
});

const user = useState("user", () => ({ id: 4 }));

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // You can specify locale and options here if needed
};

const toggleReaction = async (reactionType: "like" | "haha") => {
  try {
    const isActive = userReactions.value[reactionType];
    const action = isActive ? "unreact" : "react";
    const userId = user.value.id; // Replace with actual user ID

    // Optimistically update the UI
    if (reactionType === "like") {
      props.post.reactions.likes += isActive ? -1 : 1;
      userReactions.value.like = !isActive;
    } else if (reactionType === "haha") {
      props.post.reactions.hahas += isActive ? -1 : 1;
      userReactions.value.haha = !isActive;
    }

    await $fetch(`/api/posts/${props.post.id}/react`, {
      method: "PUT",
      body: JSON.stringify({ action, reactionType, userId }),
    });
  } catch (error) {
    console.error(`Error toggling ${reactionType} reaction:`, error);

    // Revert the optimistic update if the API call fails
    if (reactionType === "like") {
      props.post.reactions.likes += userReactions.value.like ? -1 : 1;
      userReactions.value.like = !userReactions.value.like;
    } else if (reactionType === "haha") {
      props.post.reactions.hahas += userReactions.value.haha ? -1 : 1;
      userReactions.value.haha = !userReactions.value.haha;
    }
  }
};

// Computed property to enrich content
const enrichedContent = computed(() => {
  const hashtagPattern = /#(\w+)/g;
  const mentionPattern = /@(\w+)/g;

  const newContent = props.post.content
    .replace(
      hashtagPattern,
      '<span class="text-blue-500 font-semibold">#$1</span>',
    )
    .replace(
      mentionPattern,
      '<span class="text-blue-500 font-semibold">@$1</span>',
    );

  return newContent;
});
</script>
