<template>
  <v-app :dark="darkTheme">
    <!-- Barra de Navegação Superior -->
    <v-app-bar v-if="shouldShowNavBar" app>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleDarkTheme">
        <v-icon>{{
          darkTheme ? "mdi-white-balance-sunny" : "mdi-weather-night"
        }}</v-icon>
      </v-btn>
      <v-btn icon @click="performLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Menu Lateral -->
    <v-navigation-drawer
      v-if="shouldShowNavBar"
      v-model="drawer"
      app
      class="my-drawer"
    >
      <v-list>
        <v-list-item
          :class="{ 'selected-item': isSelected('/') }"
          @click="navigateTo('/')"
        >
          <v-list-item-icon>
            <v-icon>mdi-chart-bar</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="drawer">Dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item
          :class="{ 'selected-item': isSelected('/reservas') }"
          @click="navigateTo('/reservas')"
        >
          <v-list-item-icon>
            <v-icon>mdi-calendar-check</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="drawer">Reservas</v-list-item-title>
        </v-list-item>
        <v-list-item
          :class="{ 'selected-item': isSelected('/financas') }"
          @click="navigateTo('/financas')"
        >
          <v-list-item-icon>
            <v-icon>mdi-currency-usd</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="drawer">Finanças</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/relatorios">
          <v-list-item-icon>
            <v-icon>mdi-file-document</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="drawer">Relatórios</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/lembretes">
          <v-list-item-icon>
            <v-icon>mdi-bell</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="drawer">Lembretes</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Conteúdo Principal -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Rodapé
    <AppFooter
      :isMenuExpanded="drawer"
      v-if="shouldShowNavBar"
      class="footer"
    /> -->
  </v-app>
</template>

<script>
import { mapActions } from "vuex";
// import AppFooter from "@/components/common/AppFooter.vue"; // Import the AppFooter component
import "./styles/global.css";

export default {
  components: {
    // AppFooter,
  },
  data() {
    return {
      drawer: false,
      darkTheme: JSON.parse(localStorage.getItem("darkTheme")) || false,
      dialog: false,
      snackbar: false,
      titulo: "",
      conteudo: "",
      valid: false,
      rules: {
        required: (value) => !!value || "Campo obrigatório",
      },
    };
  },
  created() {
    this.$vuetify.theme.dark = this.darkTheme;
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
    isMobile() {
      return this.$vuetify.breakpoint.xsOnly;
    },
    shouldShowNavBar() {
      const isAuthenticated = !!localStorage.getItem("userToken");
      const isLoginRoute = this.$route.name === "loginUser";
      return isAuthenticated && !isLoginRoute;
    },
  },
  watch: {
    darkTheme(newVal) {
      this.$vuetify.theme.dark = newVal;
      localStorage.setItem("darkTheme", JSON.stringify(newVal));
    },
  },
  methods: {
    ...mapActions(["loginUser", "logoutUser"]),

    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    toggleDarkTheme() {
      this.darkTheme = !this.darkTheme;
    },
    performLogout() {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
      this.$router.push("/login");
    },
    resetForm() {
      this.$refs.form.reset();
    },
    submitFeedback() {
      if (this.$refs.form.validate()) {
        const feedback = {
          titulo: this.titulo,
          conteudo: this.conteudo,
        };
        console.log(feedback);
        this.dialog = false;
        this.snackbar = true;
        this.resetForm();
      }
    },
    navigateTo(route) {
      if (this.$route.path !== route) {
        this.$router.push(route);
      }
    },
    isSelected(route) {
      return this.$route.path === route;
    },
  },
};
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  transition: margin-left 0.3s;
}
</style>
