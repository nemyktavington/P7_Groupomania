<template>
  <div>
    <v-app-bar
      style="background-color: black; color: white !important"
      dark
      dense
      fade-img-on-scroll
      scroll-target="#tabContainer"
    >
      <v-app-bar-nav-icon @click.prevent="setTab(0)">
        <v-img
          src="./assets/icon-transparent.png"
          alt="icone groupomania"
          max-height="32"
          max-width="32"
        />
      </v-app-bar-nav-icon>
      <v-tabs align-with-title :value="tab" class="tabContainer">
        <v-tab @click="setTab(0)"> Home </v-tab>
        <v-tab v-if="isLoggedIn" @click="getConnectedUser && setTab(1)"
          >Mon profil</v-tab
        >
        <v-tab v-if="isLoggedIn" @click="setTab(2)">Settings</v-tab>
        <v-tab v-if="checkTab" @click="setTab(isLoggedIn ? 3 : 1)">
          Profil de {{ userView.name }}</v-tab
        >
      </v-tabs>
      <v-autocomplete
        class="searchInput"
        allow-overflow
        menu-props="auto, overflowY"
        v-model="searchInput"
        :items="users"
        item-text="name"
        clearable
        hide-details
        item-value="name"
        label="Qui recherchez-vous ?"
        prepend-inner-icon="mdi-magnify"
        dense
        solo
        flat
        outlined
        color="button"
      >
        <template v-slot:item="{ item }">
          <v-list-item @click="redirect(item.id)"
            >{{ item.name }} {{ item.email }}</v-list-item
          >
        </template>
      </v-autocomplete>
      <div class="button-app-bar" data-app>
        {{ search }}

        <v-btn
          v-if="!isLoggedIn"
          text
          small
          @click="
            ;(signup = !signup) && (overlay = !overlay) && (login = false)
          "
        >
          s'inscrire
        </v-btn>
        <v-btn
          v-if="!isLoggedIn"
          text
          small
          @click=";(login = !login) && (overlay = !overlay) && (signup = false)"
        >
          se connecter
        </v-btn>
        <v-btn v-if="isLoggedIn" text small @click="logout" id="desktopLogout">
          déconnexion
        </v-btn>
        <v-btn
          v-if="isLoggedIn"
          text
          small
          @click="setIsLoggedIn"
          id="phoneLogout"
        >
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </div>
    </v-app-bar>
    <v-card class="overflow-hidden" id="container" style="border-radius: 0">
      <v-sheet id="tabContainer" max-height="100vh">
        <v-tabs-items :value="tab">
          <v-tab-item>
            <home-page-vue />
          </v-tab-item>
          <v-tab-item v-if="isLoggedIn">
            <my-profile-page />
          </v-tab-item>
          <v-tab-item v-if="isLoggedIn">
            <settings-page />
          </v-tab-item>
          <v-tab-item v-if="userView">
            <profile-page :user="userView" />
          </v-tab-item>
        </v-tabs-items>
        <v-overlay :value="overlay" :opacity="opacity" style="width: 100%">
          <form>
            <v-text-field
              v-model="email"
              :error-messages="emailErrors"
              label="E-mail"
              required
              @input="$v.email.$touch()"
              @blur="$v.email.$touch()"
            >
            </v-text-field>

            <v-text-field
              v-model="password"
              type="password"
              :error-messages="passwordErrors"
              label="Mot de passe"
              required
              @input="$v.password.$touch()"
              @blur="$v.password.$touch()"
              @keyup.enter="signup ? handleSignup() : handleLogin()"
            ></v-text-field>
          </form>
          <div class="overlay-buttons">
            <v-btn
              class="white--text"
              color="teal"
              @click="cancelOverlay()"
              small
            >
              Annuler
            </v-btn>
            <v-btn
              class="white--text"
              color="success"
              small
              v-if="signup"
              @click="handleSignup()"
              :loading="loading"
              :disabled="disabled"
            >
              S'inscrire
            </v-btn>
            <v-btn
              class="white--text"
              color="success"
              small
              v-if="login"
              @click="handleLogin()"
              :loading="loading"
            >
              Se connecter
            </v-btn>
          </div>
          <div class="alert-overlay">
            <v-alert
              dense
              type="info"
              v-if="passwordFeedback && signup"
              color="#00AFF4"
            >
              {{ passwordFeedback }}
            </v-alert>
          </div>
        </v-overlay>
      </v-sheet>
      <v-tabs align-with-title :value="tab" class="tabContainerMobile">
        <v-tab @click="setTab(0)"> Accueil </v-tab>
        <v-tab v-if="isLoggedIn" @click="getConnectedUser && setTab(1)"
          >Mon profil</v-tab
        >
        <v-tab v-if="isLoggedIn" @click="setTab(2)">Options</v-tab>
        <v-tab v-if="checkTab" @click="setTab(isLoggedIn ? 3 : 1)">
          Profil de {{ userView.name }}</v-tab
        >
      </v-tabs>
    </v-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, minLength, email } from 'vuelidate/lib/validators'
import zxcvbn from 'zxcvbn'
import store from './store'
import HomePageVue from './components/HomePage.vue'
import MyProfilePage from './components/MyProfilePage.vue'
import ProfilePage from './components/ProfilePage.vue'
import SettingsPage from './components/SettingsPage.vue'
import {
  getUsers,
  getUser,
  createUser,
  loginUser,
  checkToken,
} from './helpers/helper'
export default {
  name: 'App',
  mixins: [validationMixin],
  components: {
    HomePageVue,
    MyProfilePage,
    SettingsPage,
    ProfilePage,
  },
  validations: {
    email: {
      required,
      email,
    },
    password: {
      required,
      minLength: minLength(8),
    },
  },
  data: () => ({
    collapseOnScroll: true,
    email: '',
    password: '',
    overlay: false,
    signup: false,
    login: false,
    loading: false,
    disabled: true,
    emailError: false,
    passwordError: false,
    opacity: 0.8,
    passwordFeedback: '',
    searchInput: null,
    users: null,
    search: null,
  }),
  mounted: async () => {
    setInterval(() => {
      store.dispatch('getConnectedUser')
    }, 1800000)
  },
  computed: {
    checkTab() {
      console.log(this.userView && this.userView?.id != this.user?.id)
      return this.userView && this.userView.id != this.user?.id
    },
    emailErrors() {
      const errors = []
      if (this.login) return errors
      if (!this.$v.email.$dirty) return errors
      !this.$v.email.required && errors.push("L'email est requis")
      !this.$v.email.email && errors.push("L'email n'est pas valide")
      this.emailError = errors.length != 0
      this.disabled = this.emailError && this.passwordError ? false : true
      return errors
    },
    passwordErrors() {
      const errors = []
      if (this.login) return errors
      if (!this.$v.password.$dirty) return errors
      !this.$v.password.required && errors.push('Le mot de passe est requis')
      !this.$v.password.minLength &&
        errors.push('Le mot de passe doit contenir au moins 8 caractères')
      const passwordSecure = zxcvbn(this.password)
      if (passwordSecure.score < 2) {
        errors.push(passwordSecure.feedback.warning)
        this.passwordFeedback = passwordSecure.feedback.suggestions[0]
      } else {
        this.passwordFeedback = ''
      }
      this.passwordError = errors.length != 0
      this.disabled = !this.emailError && !this.passwordError ? false : true
      return errors
    },
    ...mapState({
      isLoggedIn: 'isLoggedIn',
      showSettings: 'showSettings',
      tab: 'tab',
      userView: 'userView',
      user: 'user',
      token: 'token',
    }),
  },
  created() {
    this.initData()
  },
  methods: {
    ...mapActions([
      'setIsLoggedIn',
      'setToken',
      'getConnectedUser',
      'clearState',
      'setTab',
      'setUserView',
    ]),
    cancelOverlay() {
      this.$v.$reset()
      this.overlay = false
      this.signup = false
      this.login = false
      this.loading = false
      this.email = ''
      this.password = ''
      this.passwordFeedback = ''
    },
    async initData() {
      this.users = await getUsers()
      this.setTab(0)
      const checkAuth = await (await checkToken(this.token)).json()
      console.log(checkAuth)
      if (
        checkAuth.message == 'Invalid token.' ||
        checkAuth.message == 'Invalid User.'
      ) {
        this.logout()
      }
    },
    async redirect(id) {
      if (this.isLoggedIn && id === this.user.id) this.setTab(1)
      else {
        this.setUserView(await getUser(id))
        this.setTab(this.isLoggedIn ? 3 : 2)
      }
    },
    logout() {
      this.clearState()
    },
    async handleSignup() {
      this.loading = true
      const response = await createUser(this.email, this.password)
      const data = await response.json()
      if (response.status != 201) this.passwordFeedback = data.message
      else {
        this.passwordFeedback = ''
        this.setToken(data.token)
        this.setIsLoggedIn()
        this.getConnectedUser()
        this.loading = false
        this.overlay = false
        this.signup = false
        this.login = false
        this.email = ''
        this.password = ''
      }
    },
    async handleLogin() {
      this.loading = true
      const reponse = await loginUser(this.email, this.password)
      const data = await reponse.json()
      if (reponse.status != 201) this.passwordFeedback = data.message
      else {
        this.passwordFeedback = ''
        this.setToken(data.token)
        this.setIsLoggedIn()
        this.getConnectedUser()
        this.loading = false
        this.overlay = false
        this.signup = false
        this.login = false
        this.email = ''
        this.password = ''
      }
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&display=swap');
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  font-family: 'Oswald', sans-serif;
}

.v-card {
  z-index: 0;
}

.v-app-bar-title__content {
  text-overflow: unset !important;
}

#tabContainer {
  overflow: hidden;
}

header {
  z-index: 1;
  position: fixed !important;
  height: 64px !important;
}

.overflow-y-auto {
  overflow-y: auto;
}

.overlay-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.v-messages__message {
  color: #d06a6c;
  font-weight: bold;
}

.alert-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  margin: 0;
}

#phoneLogout {
  display: none;
}

.button-app-bar {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-end;
  width: 60%;
}

.v-toolbar__content {
  height: 64px !important;
}

.v-window {
  overflow: scroll !important;
  margin-top: 4rem;
  height: 96vh;
}

.v-item-group {
  background-color: #ebebeb;
}

button {
  margin: 0;
}

.searchInput {
  z-index: 4000;
  width: 100%;
  margin: 0 10px;
}

.tabContainer {
  display: block;
}

@media only screen and (max-width: 425px) {
  .v-app-bar-title__content {
    display: none;
  }

  #phoneLogout {
    display: block;
  }

  #desktopLogout {
    display: none;
  }
  .tabContainer {
    display: none;
  }

  .tabContainerMobile {
    position: fixed;
    bottom: 0rem;
    width: 100%;
    display: flex;
    justify-content: space-around;
  }

  .avatar-name {
    width: 100%;
  }
}
</style>
