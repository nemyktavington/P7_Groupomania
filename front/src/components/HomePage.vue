<template>
  <v-container class="container">
    <div v-if="isLoggedIn">
      <add-post-vue @add-posts="addPosts" />
    </div>
    <all-post-vue :posts="posts" @update-posts="updatePosts" />
  </v-container>
</template>

<script>
import AddPostVue from './AddPost.vue'
import AllPostVue from './AllPost.vue'
import { mapState, mapActions } from 'vuex'
import { getPosts } from '@/helpers/helper'

export default {
  name: 'Home',
  components: {
    AddPostVue,
    AllPostVue,
  },
  data: () => ({
    posts: [],
  }),
  created: function () {
    this.getPosts()
  },
  methods: {
    addPosts(post) {
      this.posts.unshift(post)
    },
    async getPosts() {
      this.loading = true
      const data = await getPosts()
      this.posts = data.posts.reverse()
      this.loading = false
    },
    updatePosts(id) {
      this.posts = this.posts.filter(item => item.id != id)
    },
  },
  computed: {
    ...mapState({ isLoggedIn: 'isLoggedIn' }),
  },
}
</script>

<style>
@media (min-width: 960px) {
  .container {
    max-width: 960px;
  }
}
</style>
