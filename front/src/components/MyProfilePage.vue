<template>
  <v-container class="container">
    <div v-if="isLoggedIn">
      <v-card v-if="user.length <= 0 && posts.length <= 0">
        <v-skeleton-loader
          v-bind="user"
          type="card-avatar, article"
        ></v-skeleton-loader>
      </v-card>
      <v-card v-else>
        <v-img
          lazy-src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
          max-height="275"
          :src="user.coverUrl"
        ></v-img>
        <v-card-title>
          <div class="avatar-name">
            <v-avatar size="64">
              <img :src="user.imgUrl" />
            </v-avatar>
            <span class="headline">{{ user.name }} - {{ user.email }} </span>
          </div>
          <v-card-text class="headText">
            <v-card-text>{{ user.description }}</v-card-text>
          </v-card-text>
        </v-card-title>
      </v-card>

      <div class="ProfileBody">
        <add-post @add-posts="addPosts" />
        <posts-profile :posts="posts" @update-posts="updatePosts" />
      </div>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import AddPost from './AddPost.vue'
import PostsProfile from './PostsProfile.vue'
import { getPostsWithId } from '@/helpers/getPostsWithId'
export default {
  name: 'ProfilePage',
  components: {
    AddPost,
    PostsProfile,
  },
  data: () => ({
    posts: [],
  }),
  computed: {
    ...mapState({ isLoggedIn: 'isLoggedIn', user: 'user' }),
  },
  created: function () {
    this.getPosts()
  },
  methods: {
    ...mapActions(['setTab', 'setShowSettings']),
    showSettings() {
      this.setTab(2)
      this.setShowSettings(true)
    },
    addPosts(post) {
      this.posts.unshift(post)
    },
    updatePosts(id) {
      this.posts = this.posts.filter(item => item.id != id)
    },
    async getPosts() {
      this.loading = true
      const data = await (await getPostsWithId(this.user.id)).json()
      console.log(data)
      this.posts = data.reverse()
      this.loading = false
    },
  },
}
</script>

<style scoped>
.container {
  height: 100vh;
}

.headline {
  width: 80%;
  margin-left: 2rem;
}

.headText {
  margin-top: 0;
  padding: 0;
  margin-left: 2rem;
}

.v-image {
  margin: 0;
}

.ProfileBody {
  margin-top: 2rem;
}

.avatar-name {
  display: flex;
  width: 50%;
  align-items: center;
  justify-content: space-between;
}

.right {
  position: absolute;
  right: 10px;
  bottom: 10px;
}
</style>
