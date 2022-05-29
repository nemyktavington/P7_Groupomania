<template>
  <div class="container-AllPosts">
    <div class="container-AllPosts-header">
      <h1 class="container-AllPosts-header-title">Tous les posts</h1>
    </div>
    <div v-if="isLoading" class="loadingSkeletons">
      <v-col v-for="n in 5" :key="n">
        <v-skeleton-loader type="article, image"> </v-skeleton-loader>
      </v-col>
    </div>
    <v-item-group active-class="primary" v-else>
      <v-container class="pd0">
        <v-col class="pd0">
          <v-col
            class="pd0"
            v-for="post in posts"
            :key="post.id"
            cols="auto"
            md="auto"
          >
            <OnePost :id="post.id" :users="users" @update-posts="updatePosts" />
          </v-col>
        </v-col>
      </v-container>
    </v-item-group>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getPosts, getUsers } from '@/helpers/helper'
import OnePostVue from './OnePost.vue'
import OnePost from './OnePost.vue'
export default {
  name: 'AllPost',
  props: {
    posts: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    users: null,
    loading: true,
  }),
  components: {
    OnePostVue,
    OnePost,
  },
  computed: {
    ...mapState({ user: 'user', isLoggedIn: 'isLoggedIn' }),
    isLoading() {
      return this.users ? (this.posts ? false : true) : true
    },
  },
  created: function () {
    this.getUsers()
  },
  methods: {
    async getPosts() {
      this.loading = true
      const data = await getPosts()
      this.posts = data.posts.reverse()
      this.loading = false
    },
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
      // this.posts = this.posts.filter(item => item.id != id)
      // this.getPosts()
    },
  },
}
</script>

<style>
.container-AllPosts {
  height: 100vh;
  background-color: #ebebeb;
}

.postCard {
  width: 550px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: auto;
}

.postButtons {
  display: flex;
  justify-content: space-between;
}

.comment {
  color: #1985a1 !important;
}

.like {
  color: rgb(208, 106, 108) !important;
}

@media only screen and (max-width: 425px) {
  .container-AllPosts {
    padding: 0;
  }

  .container-AllPosts-header-title {
    margin-bottom: 2rem;
  }

  .pd0 {
    padding: 0;
  }
}
</style>
