<template>
  <div class="relative mb-5">
    <!-- Hidden div for enriched content -->
    <div
      class="w-full h-24 p-2 mb-3 border border-gray-300 rounded-md absolute top-0 left-0 z-0 whitespace-pre-wrap overflow-y-auto pointer-events-none bg-white"
      v-html="enrichedContent"
    ></div>

    <!-- Textarea -->
    <textarea
      v-model="content"
      placeholder="Write your post here"
      class="w-full h-24 p-2 mb-3 border border-gray-300 rounded-md bg-transparent relative z-10 caret-black text-transparent whitespace-pre-wrap"
    ></textarea>

    <div class="flex justify-between items-center mt-2">
      <label class="flex items-center text-gray-700">
        <input
          v-model="addFancyPicture"
          type="checkbox"
          class="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        Add fancy picture
      </label>
      <button
        class="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @click="postNewPost"
      >
        Post
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { faker } from "@faker-js/faker";

// State and variables
const posts = useState("posts", () => []);
const user = useState("user", () => null);
const content = ref("");
const addFancyPicture = ref(false);

// Function to post a new post
const postNewPost = async () => {
  const randomImage = faker.image.urlPicsumPhotos();

  const newPost = {
    id: Math.random().toString(36).substr(2, 9),
    content: content.value,
    author: { ...user.value },
    created_time: Date.now() / 1000,
    image: addFancyPicture.value ? randomImage : null,
  };

  // Optimistic update
  posts.value = [newPost, ...posts.value];

  // Save to server
  try {
    await $fetch("api/posts", {
      method: "POST",
      body: {
        image_url: addFancyPicture.value ? randomImage : null,
        content: content.value,
        authorId: user.value.id,
      },
    });
  } catch (error) {
    // Revert changes on error
    posts.value = posts.value.filter((post) => post.id !== newPost.id);
    console.error("Error posting new post:", error);
  }

  // Clear input
  content.value = "";
};

// Computed property to enrich content
const enrichedContent = computed(() => {
  const hashtagPattern = /#(\w+)/g;
  const mentionPattern = /@(\w+)/g;

  const newContent = content.value
    .replace(hashtagPattern, '<span class="text-blue-500">#$1</span>')
    .replace(mentionPattern, '<span class="text-blue-500">@$1</span>');

  return newContent;
});
</script>
