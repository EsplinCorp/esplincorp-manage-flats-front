<template>
  <v-container>
    <div class="mt-5"></div>

    <v-row align="center">
      <v-col cols="12" sm="auto" class="d-flex align-items-center">
        <span
          v-html="
            octicons.credit_card.toSVG({
              class: 'octicon mt-2',
              width: 40,
              height: 40,
            })
          "
        ></span>
        <h2 class="ml-2 mt-3 font-weight-normal primary--text">
          Pagamentos de Funcionários
        </h2>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import * as octicons from "@primer/octicons";

export default {
  data() {
    return {
      isDesktop: window.innerWidth > 600,
      octicons,
    };
  },
  computed: {
    ...mapState({
      isDarkMode: (state) => state.isDarkMode,
    }),
  },
  created() {
    window.addEventListener("resize", this.checkWidth);
  },
  destroyed() {
    window.removeEventListener("resize", this.checkWidth);
  },
  methods: {
    ...mapActions(["logoutUser"]),

    performLogout() {
      this.logoutUser()
        .then(() => {
          this.$router.push("/login");
        })
        .catch((error) => {
          console.error("Erro no logout:", error);
        });
    },
    checkWidth() {
      this.isDesktop = window.innerWidth > 600;
    },
  },
};
</script>

<style scoped>
.font-weight-normal {
  font-weight: normal;
}
</style>
