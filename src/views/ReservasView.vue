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

    <div class="mt-10"></div>

    <!-- Vuetify Tabs Component -->
    <v-tabs v-model="tab" background-color="transparent" class="custom-tabs">
      <v-tab class="custom-tab" :class="{ 'selected-tab': tab === 0 }">
        <v-icon left>mdi-account-group</v-icon> Hóspedes
      </v-tab>
      <v-tab class="custom-tab" :class="{ 'selected-tab': tab === 1 }">
        <v-icon left>mdi-home</v-icon> Flats
      </v-tab>
      <v-tab class="custom-tab" :class="{ 'selected-tab': tab === 2 }">
        <v-icon left>mdi-clipboard-text</v-icon> Histórico de Reservas
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <Hospedes />
      </v-tab-item>
      <v-tab-item>
        <Flats />
      </v-tab-item>
      <v-tab-item>
        <HistoricoReservas />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Hospedes from "@/views/HospedesView.vue";
import Flats from "@/views/FlatsView.vue";
import HistoricoReservas from "@/views/HistoricoReservasView.vue";

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
    HistoricoReservas,
  },
};
</script>

<style scoped>
.v-tab {
  text-transform: none;
}

.custom-tabs {
  border-bottom: 1px solid var(--primary-color);
}

.custom-tab {
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  margin-bottom: -1px;
  padding: 0.5rem 1rem;
  transition:
    border-color 0.15s ease-in-out,
    background-color 0.15s ease-in-out;
}

.custom-tab:hover {
  border-color: #e9ecef #e9ecef #dee2e6;
}

.selected-tab {
  border-color: var(--primary-color);
  border-bottom: 1px solid #dee2e6;
}
</style>
