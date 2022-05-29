<template>
  <v-container class="addPost">
    <v-form ref="form">
      <v-textarea
        required
        v-model="content"
        name="addPost"
        filled
        label="Say Hello world !"
        auto-grow
        value="Hello world !"
        background-color="#fff !important"
      >
      </v-textarea>
      <v-file-input
        v-model="file"
        accept="image/jpg, image/jpeg, image/png, image/webp, image/gif, video/x-msvideo, video/mp4, video/mpeg, video/ogg, video/mp2t, video/webm, video/3gpp, video/3gpp2"
        label="File input"
        filled
        prepend-icon="mdi-file-image-plus"
        background-color="#fff !important"
      ></v-file-input>
      <div class="button-container">
        <v-btn color="#D06A6C" @click="reset" style="color: #fff">
          Reset
        </v-btn>
        <v-btn
          color="#78d06a"
          :loading="loading"
          class="mr-4"
          @click="validate"
          style="color: #fff"
          :disabled="content == ''"
        >
          Envoyer
        </v-btn>
        <v-snackbar v-model="snackbar" :timeout="timeout">
          {{ text }}

          <template v-slot:action="{ attrs }">
            <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
              Close
            </v-btn>
          </template>
        </v-snackbar>
      </div>
    </v-form>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'AddPost',

  data: () => ({
    content: '',
    file: null,
    disabled: true,
    timeout: 1500,
    snackbar: false,
    text: '',
    contentMaxLength: 280,
    loading: false,
  }),
  computed: {
    ...mapState({ token: 'token' }),
  },
  methods: {
    async validate() {
      this.loading = true
      if (this.content.length > this.contentMaxLength) {
        this.text = 'Votre message est trop long'
        this.snackbar = true
        this.loading = false
        this.$refs.form.reset()
      } else {
        const formData = new FormData()
        formData.append('content', this.content)
        formData.append('image', this.file)
        const response = await fetch(`http://localhost:8081/api/posts/create`, {
          method: 'POST',
          headers: {
            authorization: this.token,
          },
          body: formData,
        })
        const data = await response.json()
        if (response.status != 201) {
          this.text = data.message
          this.snackbar = true
          this.loading = false
          this.$refs.form.reset()
        } else {
          this.text = 'Votre post a bien été crée!'
          this.loading = false
          this.snackbar = true
          this.$emit('add-posts', data.post)
          this.$refs.form.reset()
        }
      }
    },
    reset() {
      this.$refs.form.reset()
    },
  },
}
</script>

<style scoped>
.button-container {
  display: flex;
  justify-content: space-between;
}

.addPost {
  height: 100% !important;
}
</style>
