<template>
  <div>
    <NuxtLink to="/profile" class="flex items-center p-1 gap-1">
      <img :src="user.profilePhotoUrl" class="rounded-full" width="32" />
      <p>{{ user.nickname }}</p>
    </NuxtLink>

    <VirtualizedList />
    <NuxtLink
      href="compose"
      class="size-14 rounded-full bg-blue-400 flex justify-center items-center shadow-md absolute right-5 bottom-10"
    >
      <WriteIcon class="size-8" />
    </NuxtLink>
  </div>
</template>

<script setup>
const user = useState("user", () => null);
//TODO: User profile pic also to webp
user.value = await $fetch("/api/users/4").then((result) => result.user);
</script>
