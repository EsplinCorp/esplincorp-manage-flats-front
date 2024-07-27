<template>
  <v-container>
    <div class="mt-5"></div>
    <v-row align="center">
      <v-col cols="12" sm="auto" class="d-flex align-items-center">
        <v-icon color="primary" class="mt-2" size="35"
          >mdi-calendar-check</v-icon
        >
        <h2 class="ml-2 mt-3 font-weight-normal primary--text">Reservas</h2>
      </v-col>
    </v-row>
    <v-divider
      class="my-3"
      :style="{ backgroundColor: 'tertiary' }"
    ></v-divider>

    <!-- Vuetify Tabs Component -->
    <v-tabs v-model="tab" background-color="transparent">
      <v-tab>Hóspedes</v-tab>
      <v-tab>Flats</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <Hospedes />
      </v-tab-item>
      <v-tab-item>
        <Flats />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Hospedes from "@/views/HospedesView.vue";
import Flats from "@/views/FlatsView.vue";

export default {
  data() {
    return {
      isDesktop: window.innerWidth > 600,
      tab: 0, // Set the default tab index (0 for the first tab)
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
  beforeDestroy() {
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
  components: {
    Hospedes,
    Flats,
  },
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
