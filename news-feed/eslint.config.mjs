import tailwind from 'eslint-plugin-tailwindcss'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  ...tailwind.configs['flat/recommended'],
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'vue/no-v-html': 'off',
    },
  },
)
