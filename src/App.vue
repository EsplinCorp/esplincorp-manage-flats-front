<template>
  <v-app>
    <!-- Barra de Navegação Superior -->
    <v-app-bar v-if="shouldShowNavBar" app>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleDarkTheme">
        <v-icon>{{ darkTheme ? "mdi-white-balance-sunny" : "mdi-weather-night" }}</v-icon>
      </v-btn>
      <v-btn icon @click="performLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Menu Lateral -->
    <v-navigation-drawer v-if="shouldShowNavBar" v-model="drawer" app>
      <v-list>
        <v-list-item :class="{ 'selected-item': isSelected('/') }" @click="navigateTo('/')">
          <v-list-item-icon>
            <v-icon>mdi-chart-bar</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="drawer">Dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item :class="{ 'selected-item': isSelected('/hospedes') }" @click="navigateTo('/hospedes')">
          <v-list-item-icon>
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="drawer">Hóspedes</v-list-item-title>
        </v-list-item>
        <v-list-item :class="{ 'selected-item': isSelected('/flats') }" @click="navigateTo('/flats')">
          <v-list-item-icon>
            <v-icon>mdi-home-city</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="drawer">Flats</v-list-item-title>
        </v-list-item>
        <v-list-group prepend-icon="mdi-currency-usd" no-action>
          <template v-slot:activator>
            <v-list-item-title v-if="drawer">Finanças</v-list-item-title>
            <v-list-item-icon v-else>
              <v-icon>mdi-currency-usd</v-icon>
            </v-list-item-icon>
          </template>
          <v-list-item link to="/financas/receitas-despesas">
            <v-list-item-title>Receitas e Despesas</v-list-item-title>
          </v-list-item>
          <v-list-item link to="/financas/pagamento-funcionarios">
            <v-list-item-title>Pagamentos</v-list-item-title>
          </v-list-item>
          <v-list-item link to="/financas/balanco">
            <v-list-item-title>Balanço</v-list-item-title>
          </v-list-item>
        </v-list-group>
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

     <!-- Rodapé -->
     <FooterComponent v-if="shouldShowNavBar" />
  </v-app>
  
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      drawer: true,
      darkTheme: true,
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
      const isLoginRoute = this.$route.name === 'loginUser';
      return isAuthenticated && !isLoginRoute;
    },
  },
  watch: {
    darkTheme(newVal) {
      this.$vuetify.theme.dark = newVal;
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
    goToHelpSite() {
      window.open("https://unifeso.gitbook.io/orange-dragon", "_blank");
    },
    openFeedbackDialog() {
      this.dialog = true;
    },
    cancelFeedback() {
      this.dialog = false;
      this.resetForm();
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
      this.$router.push(route);
    },
    isSelected(route) {
      return this.$route.path === route;
    },
  },
};
</script>

<style scoped>
.my-drawer {
  top: -10px !important;
}

.menu-button {
  font-weight: normal;
  text-transform: none;
  font-size: 15px;
}

.logo-image {
  max-height: 300px;
  max-width: 165px;
  margin-left: 5px;
}

.v-app-bar {
  justify-content: space-between;
}

.centered-snackbar {
  align-items: center;
}
</style>
