import type { SelectUser } from '~/db/schema'

export async function useUser(userId: string) {
  const user = ref<SelectUser | null>(null)
  const errorState = useState('errorState', () => '')

  if (!user.value) {
    try {
      const response = await $fetch<{ user: SelectUser }>(`/api/users/${userId}`)
      user.value = response.user // Assign fetched user
    }
    catch (err) {
      errorState.value = 'Failed to fetch user'
      console.error('Error fetching user:', err)
    }
  }

  return { user }
}
