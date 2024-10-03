<template>
  <NuxtLink
    to="/profile"
    class="flex items-center gap-1 border-b p-1"
  >
    <img
      :src="user.profilePhotoUrl"
      class="rounded-full"
      width="32"
    >
    <p>{{ user.nickname }}</p>
  </NuxtLink>
  <PostComposer class="hidden border-b border-gray-300 md:block" />
  <VirtualizedList />
  <NuxtLink
    href="compose"
    class="absolute bottom-10 right-5 flex size-14 items-center justify-center rounded-full bg-blue-400 shadow-md md:hidden"
  >
    <WriteIcon class="size-8" />
  </NuxtLink>
</template>

<script setup>
const user = useState('user', () => ({ id: 4 }))
// TODO: User profile pic also to webp
user.value = await $fetch('/api/users/4').then(result => result.user)
</script>
