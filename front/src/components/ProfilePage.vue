<template>
  <v-container class="container">
    <div
      v-if="myUser && myUser.isAdmin"
      style="display: flex; justify-content: space-between"
    >
      <v-btn class="white--text" color="#DC143C" small @click="handleModal">
        Supprimer le compte
      </v-btn>
      <v-btn
        class="white--text"
        color="#272727C"
        small
        dark
        @click="showEditModal = true"
      >
        modifier le compte
      </v-btn>
      <v-overlay :value="showEditModal" :opacity="0.8" style="width: 100%">
        <form class="form">
          <v-text-field
            v-model="email"
            :error-messages="emailErrors"
            label="E-mail"
            @input="$v.email.$touch()"
            @blur="$v.email.$touch()"
          >
          </v-text-field>
          <!-- error message -->

          <v-text-field
            v-model="name"
            :error-messages="nameErrors"
            label="Nom"
            @input="$v.name.$touch()"
            @blur="$v.name.$touch()"
          ></v-text-field>

          <v-text-field
            v-model="description"
            :error-messages="descriptionErrors"
            label="Description"
            @input="$v.description.$touch()"
            @blur="$v.description.$touch()"
          ></v-text-field>
          <div class="overlay-buttons">
            <v-btn
              class="white--text"
              color="#272727"
              @click.prevent="cancelForm"
              :loading="formLoading"
              small
            >
              Reset
            </v-btn>
            <v-btn
              color="teal"
              small
              :loading="formLoading"
              :disabled="formDisabled"
              @click.prevent="sendForm"
            >
              Envoyer
            </v-btn>
          </div>
        </form>
      </v-overlay>
      <v-overlay :value="showModal" :opacity="0.8" style="width: 100%">
        <v-card class="overlay-card">
          <v-card-title class="overlay-card-title">
            <span class="headline">Supprimer votre compte</span>
          </v-card-title>
          <v-card-text>
            <p>
              Vous êtes sur le point de supprimer votre compte, cette action est
              irréversible.
            </p>
            <div class="overlay-button">
              <v-btn
                class="white--text"
                color="#272727"
                @click.prevent="cancelModal"
                :loading="formLoading"
                small
              >
                Annuler
              </v-btn>
              <v-btn
                class="white--text"
                color="#DC143C"
                small
                @click.prevent="deleteAccount"
              >
                Supprimer
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-overlay>
    </div>
    <v-card v-if="!user">
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
      >
      </v-img>
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
        <v-btn class="ma-1 right" dark color="#272727" fill @click="clearTab">
          Fermer
        </v-btn>
      </v-card-title>
    </v-card>

    <div class="ProfileBody">
      <all-post :posts="posts" />
    </div>
    <v-snackbar v-model="success" center :timeout="2000">
      le profile a été mis à jour avec succès !
    </v-snackbar>
    <v-snackbar v-model="error" center :timeout="2000">
      Il y'a eu une erreur lors de la modification
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { getPostsWithId } from '@/helpers/getPostsWithId'
import AllPost from './AllPost.vue'
import { deleteUser, updateUser } from '@/helpers/helper'
import { validationMixin } from 'vuelidate'
import { email, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  name: 'ProfilePage',
  mixins: [validationMixin],
  components: { AllPost },
  validations: {
    email: {
      email,
      minLength: minLength(3),
      maxLength: maxLength(50),
    },
    name: {
      minLength: minLength(3),
      maxLength: maxLength(20),
    },
    description: {
      minLength: minLength(3),
      maxLength: maxLength(50),
    },
  },
  props: {
    user: Object,
  },
  data: () => ({
    posts: [],
    loading: false,
    showModal: false,
    showEditModal: false,
    myUser: this?.$store ? this.$store.state.user : null,
    formLoading: false,
    formDisabled: false,
    email: '',
    name: '',
    description: '',
    emailError: false,
    nameError: false,
    descriptionError: false,
    success: false,
    error: false,
  }),
  created: function () {
    this.myUser = this.$store.state.user
    this.getPosts(this.user.id)
  },
  computed: {
    ...mapState({ token: 'token' }),
    emailErrors() {
      const errors = []
      if (!this.$v.email.$dirty) return errors
      !this.$v.email.email && errors.push("L'email n'est pas valide")
      this.emailError = errors.length != 0
      this.formDisabled =
        this.emailError || this.nameError || this.descriptionError
      return errors
    },
    nameErrors() {
      const errors = []
      if (!this.$v.name.$dirty) return errors
      !this.$v.name.minLength &&
        errors.push('Le nom doit contenir au moins 3 caractères')
      !this.$v.name.maxLength &&
        errors.push('Le nom ne doit pas dépasser 20 caractères')
      this.nameError = errors.length != 0
      this.formDisabled =
        this.emailError || this.nameError || this.descriptionError
      return errors
    },
    descriptionErrors() {
      const errors = []
      if (!this.$v.description.$dirty) return errors
      !this.$v.description.minLength &&
        errors.push('La description doit contenir au moins 3 caractères')
      !this.$v.description.maxLength &&
        errors.push('La description ne doit pas dépasser 200 caractères')
      this.descriptionError = errors.length != 0
      this.formDisabled =
        this.emailError || this.nameError || this.descriptionError
      return errors
    },
  },
  methods: {
    ...mapActions(['setUserView', 'setTab']),
    clearTab() {
      this.setTab(0)
      this.setUserView(null)
    },
    async getPosts(id) {
      this.loading = true
      const data = await (await getPostsWithId(id)).json()
      this.posts = data.reverse()
      this.loading = false
    },
    handleModal() {
      this.showModal = !this.showModal
    },
    cancelModal() {
      this.showModal = false
    },
    deleteAccount() {
      this.formLoading = true
      deleteUser(this.user.id, this.token).then(response => {
        if (response.status == 200) {
          this.showModal = false
          this.clearTab()
        }
      })
    },
    async sendForm() {
      this.formLoading = true
      const objectForm = {
        email: this.email,
        name: this.name,
        description: this.description,
      }
      const response = await updateUser(objectForm, this.user.id, this.token)
      const data = await response.json()
      if (response.status === 200) {
        this.formSuccess = true
        this.success = true
        this.formLoading = false
        this.showEditModal = false
        this.setUserView(data.user)
      } else {
        this.formSuccess = false
        this.error = true
        this.formLoading = false
      }
    },
    cancelForm() {
      this.name = this.description = this.email = ''
      this.showEditModal = false
      this.formLoading = false
    },
  },
}
</script>

<style scoped>
.container {
  height: 100vh;
}

.head .headText {
  margin-top: 0;
  padding: 0;
  margin-left: 1rem;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.v-image {
  margin: 0;
}

.avatar-name {
  display: flex;
  width: 75%;
  align-items: center;
  justify-content: flex-start;
}

.headline {
  margin-left: 20px;
}

.white--text {
  color: #fff !important;
}

.cover-icon {
  position: absolute;
  top: 50%;
  right: 20px;
  z-index: 3;
}

.v-text-field {
  margin-top: 0;
  width: 80%;
}

.avatar-icon {
  width: 5%;
}

.head-left {
  width: 49%;
  display: flex;
}

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
}

.overlay-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.ProfileBody {
  margin-top: 2rem;
}

.v-overlay__content {
  width: 60%;
}
</style>
