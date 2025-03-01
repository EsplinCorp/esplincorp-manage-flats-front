<template>
  <v-container>
    <div class="mt-5"></div>
    <v-row align="center">
      <v-col cols="12" sm="auto" class="d-flex align-items-center">
        <h2 class="ml-2 mt-3 font-weight-normal">Finanças</h2>
      </v-col>
    </v-row>

    <div class="mt-10"></div>

    <!-- Vuetify Tabs Component -->
    <v-tabs v-model="tab" class="custom-tabs">
      <v-tab class="custom-tab" :class="{ 'selected-tab': tab === 0 }">
        <span v-html="octicons['arrow-up-right'].toSVG({ class: 'octicon', style: tab === 0 ? 'fill: var(--primary-color);' : '' })"></span>
        <span class="tab-text">Receitas</span>
      </v-tab>
      <v-tab class="custom-tab" :class="{ 'selected-tab': tab === 1 }">
        <span v-html="octicons['arrow-down-right'].toSVG({ class: 'octicon', style: tab === 1 ? 'fill: var(--primary-color);' : '' })"></span>
        <span class="tab-text">Despesas</span>
      </v-tab>
      <v-tab class="custom-tab" :class="{ 'selected-tab': tab === 2 }">
        <span v-html="octicons['law'].toSVG({ class: 'octicon', style: tab === 2 ? 'fill: var(--primary-color);' : '' })"></span>
        <span class="tab-text">Balanço</span>
      </v-tab>
    </v-tabs>

    <v-tabs-items background-color="#dee2e6" v-model="tab">
      <v-tab-item>
        <Receitas />
      </v-tab-item>
      <v-tab-item>
        <Despesas />
      </v-tab-item>
      <v-tab-item>
        <Balanco />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Receitas from "@/views/ReceitasView.vue";
import Despesas from "@/views/DespesasView.vue";
import Balanco from "@/views/BalancoView.vue";
import * as octicons from "@primer/octicons";

export default {
  data() {
    return {
      isDesktop: window.innerWidth > 600,
      tab: 0, // Set the default tab index (0 for the first tab)
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
    Receitas,
    Despesas,
    Balanco,
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

.tab-text {
  margin-left: 8px;
}
</style>