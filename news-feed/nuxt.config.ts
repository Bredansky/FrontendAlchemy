// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "@nuxt/image"],

  typescript: {
    typeCheck: true,
    strict: true,
  },

  components: [
    {
      path: "~/features",
      pathPrefix: false,
    },
  ],
});
