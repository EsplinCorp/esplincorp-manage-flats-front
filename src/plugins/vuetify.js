import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true, // Modo escuro ativado
    themes: {
      light: {
        primary: "#000000", // Azul primário
        secondary: "#424242", // Cinza escuro
        accent: "#82B1FF", // Azul claro
        error: "#FF5252", // Vermelho
        info: "#2196F3", // Azul
        success: "#4CAF50", // Verde
        warning: "#FFC107", // Amarelo
      },
      dark: {
        primary: "#2196F3", // Azul primário
        secondary: "#424242", // Cinza escuro
        accent: "#82B1FF", // Azul claro
        error: "#FF5252", // Vermelho
        info: "#2196F3", // Azul
        success: "#4CAF50", // Verde
        warning: "#FFC107", // Amarelo
      },
    },
  },
});
