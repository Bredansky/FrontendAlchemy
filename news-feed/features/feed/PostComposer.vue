<template>
  <div class="relative p-2">
    <!-- Hidden div for enriched content -->
    <div
      class="w-[calc(100%_-_1rem)] h-24 p-2 border border-gray-300 rounded-md absolute top-2 left-2 z-0 whitespace-pre-wrap overflow-y-auto pointer-events-none bg-white"
      v-html="enrichedContent"
    ></div>

    <!-- Textarea -->
    <textarea
      v-model="content"
      placeholder="Write your post here"
      class="w-full h-24 p-2 border border-gray-300 rounded-md bg-transparent relative z-10 caret-black text-transparent whitespace-pre-wrap"
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
        :disabled="isPostButtonDisabled"
        @click="postNewPost"
      >
        Post
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { faker } from "@faker-js/faker";
import type { SelectUser } from "~/db/schema";
import type { AuthoredPostWithHeight } from "./FeedPost.vue";

const route = useRoute();
const viewPortWidth = useState("viewPortWidth", () => 0);
const posts = useState<AuthoredPostWithHeight[]>("posts", () => []);
const user = useState<SelectUser>("user", () => ({
  createdAt: new Date(),
  nickname: "Unknown",
  profilePhotoUrl: "",
  id: 0,
}));
const content = ref("");
const addFancyPicture = ref(false);
const isPostButtonDisabled = computed(() => {
  return content.value.trim() === "" && !addFancyPicture.value;
});

// Function to post a new post
const postNewPost = async () => {
  //TODO: To the constant image config or something
  const randomImage =
    faker.image.urlPicsumPhotos({ width: 320, height: 180 }) + ".webp";

  const dummyPost = {
    id: parseInt(Math.random().toString().slice(2, 9), 10),
    content: content.value,
    author: { ...user.value },
    imageUrl: addFancyPicture.value ? randomImage : null,
    reactions: {
      likes: 0,
      hahas: 0,
    },
    currentUserReaction: {
      liked: false,
      hahaed: false,
    },
    createdAt: new Date(),
    authorId: user.value.id,
    height: 0,
  };

  //TODO: Set propper width
  dummyPost.height = calculatePostHeight(dummyPost, viewPortWidth.value);

  // Optimistic update
  posts.value = [dummyPost, ...posts.value];

  // Save to server
  try {
    //TODO: key chained stores of users posts and reactions!!!!! !! ! ! ! !  !
    //TODO: update specific post in state after fetching
    const { newPost } = await $fetch<{
      newPost: { lastInsertRowid: number };
    }>("api/posts", {
      method: "POST",
      body: {
        imageUrl: addFancyPicture.value ? randomImage : null,
        content: content.value,
        authorId: user.value.id,
      },
    });

    posts.value = posts.value.map((post) => {
      if (post.id === dummyPost.id) {
        console.log(newPost.lastInsertRowid);
        return {
          ...post,
          id: newPost.lastInsertRowid,
        };
      }
      return post;
    });
    console.log(posts.value);
  } catch (error) {
    // Revert changes on error
    posts.value = posts.value.filter((post) => post.id !== dummyPost.id);
    console.error("Error posting new post:", error);
  }

  // Clear input
  content.value = "";

  if (route.name !== "feed") {
    navigateTo("/feed");
  }
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
