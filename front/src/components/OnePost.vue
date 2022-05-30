<template>
  <v-container class="postView">
    <div v-if="isLoading" class="loadingSkeletons">
      <v-skeleton-loader type="article, image"> </v-skeleton-loader>
    </div>
    <div class="postContainer" v-else>
      <v-card class="postCard" v-if="userp">
        <v-list-item class="headerCard">
          <v-list-item-avatar
            color="grey darken-3"
            @click="redirect(userp.id)"
            class="pointer"
          >
            <v-img class="elevation-6" alt="image" :src="userp.imgUrl"> </v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title
              style="margin-left: 10px"
              @click="redirect(userp.id)"
              class="pointer"
              >{{ userp ? userp.name : 'name' }} -
              {{ userp ? userp.email : 'email' }} -
              {{
                new Date(post.createdAt).toLocaleDateString()
              }}</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>
        <v-card-text class="text-h5 font-weight-bold cardContent">
          {{ post.textContent }}
          <v-spacer></v-spacer>
        </v-card-text>
        <div v-if="post && post.imgUrl">
          <v-img :src="post.imgUrl" contain max-height="420px"></v-img>
        </div>
        <v-card-actions class="postButtons">
          <div>
            <v-menu open-on-hover top offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="ml-2 like"
                  small
                  text
                  v-bind="attrs"
                  v-on="on"
                  @click="like()"
                  :loading="loadingLike"
                >
                  <v-icon> mdi-heart</v-icon>
                  <strong>
                    {{ post.likes }}
                  </strong>
                </v-btn>
              </template>

              <v-list width="200px" v-if="post.userLiked.length > 0">
                <v-list-item
                  v-for="id in post.userLiked"
                  :key="id"
                  @click="redirect(id)"
                >
                  <v-list-item-avatar>
                    <v-img
                      class="elevation-6"
                      alt="image"
                      :src="getUser(id).imgUrl"
                    />
                  </v-list-item-avatar>
                  <v-list-item-title class="ml-4">
                    {{ getUser(id).name }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <div
            v-if="isLoggedIn && ((user && user.id == userp.id) || user.isAdmin)"
          >
            <v-btn class="ml-2 comment" text small @click="editable = true">
              <v-icon> mdi-pencil </v-icon>
            </v-btn>
          </div>
          <div>
            <v-btn
              class="ml-2 comment"
              text
              small
              @click="comments = !comments"
              :loading="loadingComments"
            >
              <strong>
                {{ post.comments ? post.comments.length : 0 }}
              </strong>
              <v-icon> mdi-chat </v-icon>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
      <!-- comments card -->
      <v-card
        elevation="16"
        max-width="400"
        width="400"
        height="580"
        max-height="580"
        class="mx-aut commentContainer"
        v-if="comments"
      >
        <div class="noComment" v-if="post.comments.length == 0">
          Aucun commentaire...
        </div>
        <v-list class="commentSection" v-else-if="!loadingComments">
          <template v-for="(item, index) in post.comments">
            <v-list-item :key="index">
              <v-list-item-avatar @click="redirect(id)">
                <v-img
                  class="elevation-6"
                  alt="image"
                  :src="getUser(item.userId) ? getUser(item.userId).imgUrl : ''"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="ml-4" @click="redirect(id)">
                  {{ getUser(item.userId) ? getUser(item.userId).name : '' }} -
                  {{ new Date(post.createdAt).toLocaleDateString() }}
                </v-list-item-title>
                <v-list-item-subtitle class="ml-4">
                  {{ item.text }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
          </template>
        </v-list>
        <div v-else class="loadingComments">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
        <div class="commentTextField">
          <v-text-field
            v-model="commentText"
            clearable
            full-width
            regular
            label="Ajoutez un commentaire"
            :append-outer-icon="'mdi-send'"
            @click:append-outer="sendMessage"
            @keyup.enter="sendMessage"
          ></v-text-field>
        </div>
      </v-card>
    </div>
    <v-snackbar v-model="error" dark center :timeout="2000">
      <v-icon color="#fc256f" style="margin-right: 4px"> mdi-alert </v-icon
      >{{ errorMsg }}
    </v-snackbar>
    <!-- overlay for edit post -->
    <v-overlay :value="editable" :opacity="0.8" style="width: 100%">
      <v-card class="postCard">
        <v-list-item class="headerCard">
          <v-list-item-avatar color="grey darken-3">
            <v-img
              class="elevation-6"
              alt="image"
              :src="userp ? userp.imgUrl : 'W'"
            >
            </v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title style="margin-left: 10px"
              >{{ userp ? userp.name : 'name' }} -
              {{ userp ? userp.email : 'email' }} -
              {{
                new Date(post ? post.createdAt : 0).toLocaleDateString()
              }}</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>
        <v-textarea
          required
          v-model="textEdit"
          counter
          :rules="rules"
          name="updatePost"
          solo
          v-bind:value="post ? post.textContent : ''"
          style="align-items: center; height: 80%"
        >
        </v-textarea>
        <v-file-input
          v-model="fileEdit"
          accept="image/jpg, image/jpeg, image/png, image/webp, image/gif, video/x-msvideo, video/mp4, video/mpeg, video/ogg, video/mp2t, video/webm, video/3gpp, video/3gpp2"
          label="File input"
          filled
          prepend-inner-icon="mdi-file-image-plus"
          prepend-icon=""
          style="width: 80%; margin: 0 auto"
        ></v-file-input>
      </v-card>
      <!-- form for edit post -->
      <div class="button-container">
        <v-btn color="#D06A6C" @click="cancelOverlay" style="color: #fff">
          Reset
        </v-btn>
        <v-btn color="#D06A6C" @click="deletePost" style="color: #fff">
          Supprimer
        </v-btn>
        <v-btn
          color="#78d06a"
          :loading="loading"
          class="mr-4"
          @click="validate"
          style="color: #fff"
          :disabled="
            (textEdit == '' || textEdit == post.textContent) && fileEdit == null
          "
        >
          Envoyer
        </v-btn>
        <!-- snackbar to notif user if edit is valid -->
        <v-snackbar v-model="snackbar" :timeout="timeout">
          {{ text }}

          <template v-slot:action="{ attrs }">
            <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
              Close
            </v-btn>
          </template>
        </v-snackbar>
      </div>
    </v-overlay>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { getPost, getUser, like, addComment } from '@/helpers/helper'
export default {
  name: 'OnePost',
  props: {
    users: Array,
    id: Number,
  },
  data: () => ({
    post: null,
    userp: null,
    error: false,
    errorMsg: '',
    loadingLike: false,
    comments: false,
    commentText: '',
    loadingComments: false,
    editable: false,
    textEdit: '',
    fileEdit: null,
    loading: false,
    snackbar: false,
    timeout: 3000,
    text: '',
    rules: [v => v.length < 256 || 'Max 256 characters'],
  }),
  computed: {
    ...mapState({
      user: 'user',
      isLoggedIn: 'isLoggedIn',
      token: 'token',
      showSettings: 'showSettings',
      tab: 'tab',
      userView: 'userView',
    }),
    isLoading() {
      return !this.post && !this.userp
    },
  },
  created: async function () {
    await this.setPost()
    await this.setUser()
  },
  methods: {
    ...mapActions(['setTab', 'setUserView']),
    async setPost() {
      const data = await getPost(this.id)
      this.post = data.post
      this.textEdit = data.post.textContent
      this.post.userLiked = data.post.userLiked.reverse()
    },
    async setUser() {
      if (this.post && this.post.userId)
        this.userp = await getUser(this.post.userId)
    },
    async sendMessage() {
      if (!this.commentText || this.commentText.length > 256)
        this.toggleError(
          'Veuillez entrer un commentaire de moins de 256 caractères'
        )
      else {
        const comment = this.commentText
        this.loadingComments = true
        const data = await addComment(this.id, this.token, comment)
        if (data.error) {
          this.toggleError(data.error)
          this.loadingComments = false
        } else {
          this.post.comments.push({
            userId: this.user.id,
            text: comment,
            date: new Date(),
          })
          this.commentText = ''
          this.loadingComments = false
        }
      }
    },
    async like() {
      this.loadingLike = true
      const response = await like(this.id, this.token)
      if (response.status == 401 || response.status == 404)
        this.toggleError('Verify your connection')
      if (response.status == 500) this.toggleError('Server error')
      if (response.status == 200) {
        const data = await response.json()
        this.post.likes = this.post.likes - (data.like == 'like' ? -1 : 1)
        if (this.post.userLiked.includes(this.user.id))
          this.post.userLiked.splice(
            this.post.userLiked.indexOf(this.user.id),
            1
          )
        // remove user from array
        else this.post.userLiked.push(this.user.id) // add user to array
      }
      this.loadingLike = false
    },
    toggleError(msg) {
      this.error = true
      this.errorMsg = msg
    },
    getUser(id) {
      return this.users ? this.users.find(user => user.id == id) : null
    },
    async redirect(id) {
      if (this.isLoggedIn && id === this.user.id) this.setTab(1)
      else {
        this.setUserView(await getUser(id))
        this.setTab(this.isLoggedIn ? 3 : 1)
      }
    },
    cancelOverlay() {
      this.editable = false
      this.textEdit = this.post.textContent
      this.fileEdit = null
    },
    async validate() {
      this.loading = true
      if (
        (this.textEdit.length > 256 || this.textEdit.length < 1) &&
        this.fileEdit == null
      ) {
        this.text = 'Veuillez entrer un commentaire de moins de 256 caractères'
        this.snackbar = true
        this.loading = false
      } else {
        const formData = new FormData()
        formData.append('content', this.textEdit)
        formData.append('image', this.fileEdit)
        const response = await fetch(
          `http://localhost:8081/api/posts/${this.post.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `${this.token}`,
            },
            body: formData,
          }
        )
        const data = await response.json()
        if (response.status != 200) {
          this.text = data.message
          this.snackbar = true
          this.loading = false
          this.fileEdit = null
          this.textEdit = this.post.textContent
        } else {
          this.editable = false
          this.text = 'Votre post a bien été modifié !'
          this.loading = false
          this.snackbar = true
          this.post = data.post
          this.fileEdit = null
          this.textEdit = this.post.textContent
        }
      }
    },
    async deletePost() {
      const response = await fetch(
        `http://localhost:8081/api/posts/${this.post.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `${this.token}`,
          },
        }
      )
      const data = await response.json()
      if (response.status != 200) {
        this.text = data.message
        this.snackbar = true
      } else {
        this.$emit('update-posts', this.post.id)
        this.editable = false
        this.text = 'Votre post a bien été supprimé !!'
        this.loading = false
        this.snackbar = true
        this.post = data.post
        this.fileEdit = null
        this.textEdit = ''
      }
    },
  },
}
</script>

<style scoped>
.v-btn {
  padding: 0 !important;
}

.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.postContainer {
  display: flex;
  width: 80%;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.commentSection {
  width: 400px;
  overflow-y: scroll;
  height: 87%;
  max-height: 500px;
}

@media (max-width: 768px) {
  .postContainer {
    flex-direction: column;
  }
  .commentSection {
    width: 100%;
    max-height: 13vh;
  }
  .commentContainer {
    width: 100% !important;
    max-height: 23vh !important;
    margin: 1rem;
    max-width: 100% !important;
  }
}
.postCard {
  margin: 0 1rem;
  height: 580px;
}

.noComment {
  height: 87%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ml-4 {
  margin-left: 1rem;
}

.commentTextField {
  width: 90%;
  margin: auto;
}

.v-list-item__subtitle {
  overflow: visible !important;
  text-overflow: unset !important;
  white-space: initial !important;
}

.headerCard {
  flex: 0;
}

.cardContent {
  margin: auto;
  font-weight: bold;
  font-size: 1.2rem;
}

.loadingComments {
  height: 500px;
  max-height: 500px;
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex: 0;
  margin: auto;
}

.pointer:hover {
  cursor: pointer;
}

@media only screen and (max-width: 425px) {
  .postView {
    width: 100%;
    padding: 0;
  }
  .postContainer {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  .postCard {
    margin: 0;
  }
  .commentContainer {
    margin: 1rem 0;
  }
}
</style>
