<template>
  <div class="container-AllPosts">
    <div class="container-AllPosts-header">
      <h1 class="container-AllPosts-header-title">Tous les posts</h1>
    </div>
    <div v-if="loading" class="loadingSkeletons">
      <v-col v-for="n in 5" :key="n">
        <v-skeleton-loader type="article, image"> </v-skeleton-loader>
      </v-col>
    </div>
    <v-item-group active-class="primary" v-else-if="posts">
      <v-container>
        <v-col>
          <v-col v-for="post in posts" :key="post.id" cols="auto" md="auto">
            <OnePost :id="post.id" :users="users" @update-posts="updatePosts" />
          </v-col>
        </v-col>
      </v-container>
    </v-item-group>
    <div v-else class="noPost">Aucun post actuellement...</div>
  </div>
</template>

<script>
import OnePostVue from './OnePost.vue'
import OnePost from './OnePost.vue'
import { getPostsWithId, getUsers } from '@/helpers/helper'

export default {
  name: 'PostsProfile',
  props: {
    posts: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    loading: true,
    users: [],
  }),
  components: {
    OnePost,
    OnePostVue,
  },
  computed: {
    isLoading() {
      return this.users ? (this.posts ? false : true) : true
    },
  },
  created: function () {
    this.getUsers()
  },
  methods: {
    // async getPosts() {
    //   this.loading = true
    //   const data = await (await getPostsWithId(this.id)).json()
    //   console.log(data)
    //   this.posts = data.reverse()
    //   this.loading = false
    // },
    async getUsers() {
      this.loading = true
      const data = await getUsers()
      this.users = data
      this.loading = false
    },
    getUser(id) {
      return this.users ? this.users.find(user => user.id == id) : null
    },
    async updatePosts(id) {
      this.$emit('update-posts', id)
      //   this.posts = this.posts.filter(item => item.id != id)
      //   this.getPosts()
    },
  },
}
</script>

<style scoped>
.noPost {
  text-align: center;
  margin-top: 2rem;
}
</style>
