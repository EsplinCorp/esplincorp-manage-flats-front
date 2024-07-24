import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import actions from "./actions";
import mutations from "./mutations";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    token: null,
    hospedes: [],
    flats: [],
  },
  mutations: {
    ...mutations,
    setHospedes(state, hospedes) {
      state.hospedes = hospedes;
    },
    setFlats(state, flats) {
      state.flats = flats;
    },
  },
  actions: {
    ...actions,
    async fetchFlats({ commit }) {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/flats/listar",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        commit("setFlats", response.data);
      } catch (error) {
        console.error("Erro ao buscar flats:", error);
      }
    },
    async fetchHospedes({ commit, state }) {
      try {
        if (state.flats.length === 0) {
          await this.dispatch("fetchFlats");
        }

        const response = await axios.get(
          "http://localhost:8080/api/hospedes/listar",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );

        const hospedes = response.data.map((hospede) => {
          const flat = state.flats.find((flat) => flat.id === hospede.flatId);
          return {
            ...hospede,
            flatName: flat ? flat.nome : "N/A",
          };
        });

        commit("setHospedes", hospedes);
      } catch (error) {
        console.error("Erro ao buscar hóspedes:", error);
      }
    },
  },
});
