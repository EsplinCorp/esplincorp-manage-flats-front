<template>
  <v-app :dark="darkTheme">

    <!-- Menu Lateral -->
    <v-navigation-drawer
      v-if="shouldShowNavBar"
      v-model="drawer"
      :mini-variant="!drawer"
      app
      permanent
      class="my-drawer"
      width="220"
      >
        <v-list class="d-flex flex-column fill-height compact-menu">
        <!-- Itens principais do menu -->
        <div class="flex-grow-1">
          <v-list-item
            :class="{ 'selected-item': isSelected('/') }"
            @click="navigateTo('/')"
          >
            <v-tooltip v-if="!drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-chart-bar</v-icon>
                </v-list-item-icon>
              </template>
              <span>Dashboard</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <v-icon>mdi-chart-bar</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Dashboard</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            :class="{ 'selected-item': isSelected('/reservas') }"
            @click="navigateTo('/reservas')"
          >
            <v-tooltip v-if="!drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-calendar-check-outline</v-icon>
                </v-list-item-icon>
              </template>
              <span>Reservas</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <v-icon>mdi-calendar-check-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Reservas</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            :class="{ 'selected-item': isSelected('/financas') }"
            @click="navigateTo('/financas')"
          >
            <v-tooltip v-if="!drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-currency-usd</v-icon>
                </v-list-item-icon>
              </template>
              <span>Finanças</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <v-icon>mdi-currency-usd</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Finanças</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            :class="{ 'selected-item': isSelected('/relatorios') }"
            @click="navigateTo('/relatorios')"
          >
            <v-tooltip v-if="!drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-file-document-outline</v-icon>
                </v-list-item-icon>
              </template>
              <span>Relatórios</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <v-icon>mdi-file-document-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Relatórios</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            :class="{ 'selected-item': isSelected('/lembretes') }"
            @click="navigateTo('/lembretes')"
          >
            <v-tooltip v-if="!drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-bell-outline</v-icon>
                </v-list-item-icon>
              </template>
              <span>Lembretes</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <v-icon>mdi-bell-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Lembretes</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>

        <!-- Botões no final do menu lateral -->
        <div class="mt-auto">
          <v-divider></v-divider>
          <v-list-item @click="toggleDrawer" class="menu-bottom-item">
            <v-tooltip v-if="!drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-menu-close</v-icon>
                </v-list-item-icon>
              </template>
              <span>Expandir Menu</span>
            </v-tooltip>
            <v-tooltip v-else bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-menu-open</v-icon>
                </v-list-item-icon>
              </template>
              <span>Recolher Menu</span>
            </v-tooltip>
            <v-list-item-content>
              <v-list-item-title>{{ drawer ? "Recolher Menu" : "Expandir Menu" }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="toggleDarkTheme" class="menu-bottom-item">
            <v-tooltip v-if="!drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <v-icon>{{
                    darkTheme ? "mdi-white-balance-sunny" : "mdi-weather-night"
                  }}</v-icon>
                </v-list-item-icon>
              </template>
              <span>{{ darkTheme ? "Ativar Modo Claro" : "Ativar Modo Escuro" }}</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <v-icon>{{
                darkTheme ? "mdi-white-balance-sunny" : "mdi-weather-night"
              }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ darkTheme ? "Ativar Modo Claro" : "Ativar Modo Escuro" }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="performLogout" class="menu-bottom-item">
            <v-tooltip v-if="!drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-logout</v-icon>
                </v-list-item-icon>
              </template>
              <span>Sair</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Sair</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>

    <!-- Conteúdo Principal -->
    <v-main>
      <router-view />
    </v-main>

    <AppFooter
      :isMenuExpanded="drawer"
      v-if="shouldShowNavBar"
      class="footer"
    />
  </v-app>
</template>

<script>
import { mapActions } from "vuex";
import AppFooter from "@/components/common/AppFooter.vue";
import "./styles/global.css";

export default {
  components: {
    AppFooter,
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

.menu-item {
  margin-bottom: 16px;
}

.fill-height {
  height: 100%;
}

.compact-menu .v-list-item__icon {
  margin-right: 14px;
}

.my-drawer {
  background-color: #f8f9fa;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.theme--dark .my-drawer {
  background-color: #2d3748;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.selected-item {
  background-color: rgba(66, 153, 225, 0.1);
  border-left: 3.5px solid var(--primary-color);
}

.v-list {
  padding-top: 0 !important;
}

.v-navigation-drawer .v-list {
  padding: 0;
}

.flex-grow-1 .v-list-item:first-child {
  margin-top: 0;
}
</style>