<template>
  <v-container>
    <div class="mt-5"></div>

    <v-row align="center">
      <v-col cols="12" sm="auto" class="d-flex align-items-center">
        <v-icon class="mt-2" size="35">mdi-file-document</v-icon>
        <h2 class="ml-2 mt-3 font-weight-normal">Relatórios</h2>
      </v-col>
    </v-row>
    <v-divider
      class="my-3"
      :style="{ backgroundColor: 'tertiary' }"
    ></v-divider>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  data() {
    return {
      isDesktop: window.innerWidth > 600,
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
