<template>
  <v-container class="container">
    <div v-if="isLoggedIn">
      <v-card v-if="!user">
        <v-skeleton-loader
          v-bind="attrs"
          type="card-avatar, article"
        ></v-skeleton-loader>
      </v-card>
      <v-card v-else>
        <v-img
          lazy-src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
          max-height="275"
          :src="cover ? cover : user.coverUrl"
        ></v-img>
        <div class="cover-icon">
          <v-file-input
            v-model="fileCover"
            accept="image/png, image/jpeg, image/bmp"
            show-size
            class="cover-icon"
            hide-input
            prepend-icon="mdi-camera-plus"
            @change="previewCover"
          >
          </v-file-input>
        </div>
        <v-card-title>
          <div class="avatar-name">
            <v-avatar size="64">
              <img :src="avatar ? avatar : user.imgUrl" />
            </v-avatar>
            <span class="headline">{{ user.name }} - {{ user.email }} </span>
          </div>
          <v-card-text class="headText">
            <div class="head-left">
              <v-file-input
                v-model="fileAvatar"
                accept="image/png, image/jpeg, image/bmp"
                show-size
                class="avatar-icon"
                hide-input
                prepend-icon="mdi-camera"
                @change="previewAvatar"
              >
              </v-file-input>
              <v-card-text>{{ user.description }}</v-card-text>
            </div>
            <div class="head-right">
              <v-btn
                :disabled="disableButton"
                class="ma-1"
                color="#272727"
                dark
                fill
                @click.prevent="cancelPreview"
              >
                Annuler
              </v-btn>

              <v-btn
                :disabled="disableButton"
                :loading="imgLoading"
                class="ma-1"
                dark
                color="#272727"
                fill
                @click="uploadImages"
              >
                Confirmer
              </v-btn>
            </div>
          </v-card-text>
        </v-card-title>
      </v-card>
    </div>
    <v-snackbar v-model="imgLoading" dark center>
      Votre image est en train d'être uploadée, veuillez patienter...
    </v-snackbar>
    <v-snackbar v-model="imgError" dark center :timeout="2000">
      Erreur lors de l'upload de votre image, veuillez réessayer ou contacter
      l'administrateur.
    </v-snackbar>
    <v-snackbar v-model="imgSuccess" center :timeout="2000">
      Votre image a été uploadée avec succès !
      <v-btn color="#fd6c9e" text @click="imgSuccess = false"> Close </v-btn>
    </v-snackbar>
    <v-snackbar v-model="formSuccess" center :timeout="2000">
      Votre profile a été mis à jour avec succès !
      <v-btn color="#fd6c9e" text @click="formSuccess = false"> Close </v-btn>
    </v-snackbar>
    <v-spacer></v-spacer>
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
        <v-btn class="white--text" color="#DC143C" small @click="handleModal">
          Supprimer votre compte
        </v-btn>
        <v-overlay :value="showModal" :opacity="0.8" style="width: 100%">
          <v-card class="overlay-card">
            <v-card-title class="overlay-card-title">
              <span class="headline">Supprimer votre compte</span>
            </v-card-title>
            <v-card-text>
              <p>
                Vous êtes sur le point de supprimer votre compte, cette action
                est irréversible.
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
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { email, minLength, maxLength } from 'vuelidate/lib/validators'
import {
  deleteUser,
  updateUser,
  uploadCover,
  uploadAvatar,
} from '@/helpers/helper'
export default {
  name: 'SettingsPage',
  mixins: [validationMixin],
  components: {},
  validations: {
    name: {
      minLength: minLength(3),
      maxLength: maxLength(20),
    },
    email: {
      email,
    },
    description: {
      minLength: minLength(3),
      maxLength: maxLength(200),
    },
  },
  data: () => ({
    fileCover: null,
    cover: null,
    fileAvatar: null,
    avatar: null,
    imgLoading: false,
    formLoading: false,
    formDisabled: true,
    formSuccess: false,
    imgSuccess: false,
    imgError: false,

    email: '',
    name: '',
    description: '',
    emailError: false,
    nameError: false,
    descriptionError: false,
    disabledButton: true,
    showModal: false,
  }),
  computed: {
    ...mapState({ isLoggedIn: 'isLoggedIn', user: 'user', token: 'token' }),
    disableButton() {
      return !this.cover && !this.avatar
    },
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
    ...mapActions({
      getConnectedUser: 'getConnectedUser',
      setUser: 'setUser',
      clearState: 'clearState',
      setShowSettings: 'setShowSettings',
      setTab: 'setTab',
    }),
    async sendForm() {
      const objectForm = {
        email: this.email,
        name: this.name,
        description: this.description,
      }
      const response = await updateUser(objectForm, this.user.id, this.token)
      const data = await response.json()
      if (response.status === 200) {
        this.formSuccess = true
        this.error = false
        this.formLoading = false
        this.formDisabled = true
        this.setUser(data.user)
      } else {
        this.formSuccess = false
        this.error = true
        this.formLoading = false
        this.formDisabled = true
      }
    },
    previewCover() {
      this.cover = URL.createObjectURL(this.fileCover)
    },
    previewAvatar() {
      this.avatar = URL.createObjectURL(this.fileAvatar)
    },
    async uploadCover() {
      const formData = new FormData()
      formData.append('image', this.fileCover)
      const response = await uploadCover(formData, this.user.id, this.token)
      const data = await response.json()
      if (data.user) {
        this.setUser(data.user)
        this.fileCover = null
        return true
      }
      this.fileCover = null
      return false
    },
    async uploadAvatar() {
      const formData = new FormData()
      formData.append('image', this.fileAvatar)
      const response = await uploadAvatar(formData, this.user.id, this.token)
      const data = await response.json()
      if (data.user) {
        this.setUser(data.user)
        this.fileAvatar = null
        return true
      }
      this.fileAvatar = null
      return false
    },
    async uploadImages() {
      this.imgLoading = true
      if (this.cover) {
        const response = await this.uploadCover()
        if (response) {
          this.imgSuccess = true
        } else {
          this.error = true
        }
      }
      if (this.avatar) {
        const response = await this.uploadAvatar()
        if (response) {
          this.imgSuccess = true
        } else {
          this.error = true
        }
      }

      this.imgLoading = false
    },
    cancelPreview() {
      this.fileCover = this.fileAvatar = this.cover = this.avatar = null
    },
    cancelForm() {
      this.name = this.description = this.email = ''
      this.formDisabled = true
      this.formLoading = true
      setTimeout(() => {
        this.formDisabled = true
        this.formLoading = false
      }, 2000)
    },
    // close() {
    //     this.email = this.name = this.description = '';
    //     this.emailError = this.nameError = this.descriptionError = false;
    //     this.formLoading = true;

    //     setTimeout(() => {
    //         this.formDisabled = true;
    //         this.setShowSettings();
    //         this.formLoading = false;
    //         this.setTab(1);
    //     }, 1000);

    // },
    handleModal() {
      this.showModal = !this.showModal
    },
    cancelModal() {
      this.showModal = false
    },
    deleteAccount() {
      this.showModal = false
      this.imgLoading = true
      deleteUser(this.user.id, this.token).then(response => {
        if (response.status == 200) {
          this.imgLoading = false
          this.clearState()
        }
      })
    },
  },
}
</script>

<style scoped>
.container {
  height: 100vh;
}

.headText {
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
  width: 50%;
  align-items: center;
  justify-content: space-between;
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

@media only screen and (max-width: 425px) {
  .avatar-name {
    width: 100%;
  }
  .headText {
    flex-direction: column;
  }
  .head-left {
    width: 100%;
  }

  .overlay-buttons {
    flex-direction: column;
    margin-bottom: 2rem;
  }
}
</style>
