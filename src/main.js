import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "./services/axios/axios-config";
import { formatDate } from "./filters/dateFilter";

Vue.filter("formatDate", formatDate);

Vue.config.productionTip = false;

// Verificar se há um token de usuário no localStorage e carregar os dados do usuário
const userToken = localStorage.getItem("userToken");
const userInfo = localStorage.getItem("userInfo");

if (userToken && userInfo) {
  store.commit("SET_TOKEN", userToken);
  store.commit("SET_USER", JSON.parse(userInfo));
}

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
  mounted() {
    this.setCSSVariables();
  },
  methods: {
    setCSSVariables() {
      const theme = this.$vuetify.theme.themes.light;
      document.documentElement.style.setProperty(
        "--primary-color",
        theme.primary,
      );
      document.documentElement.style.setProperty(
        "--secondary-color",
        theme.secondary,
      );
      document.documentElement.style.setProperty(
        "--tertiary-color",
        theme.tertiary,
      );
      document.documentElement.style.setProperty(
        "--tertiary2-color",
        theme.tertiary2,
      );
      document.documentElement.style.setProperty("--white-color", theme.white);
    },
  },
}).$mount("#app");
