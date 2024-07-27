import api from "@/services/api/api.js";
import axios from "axios";

export default {
  async loginUser({ commit }, credentials) {
    try {
      const response = await api.post("/login", credentials);
      const { token, user } = response.data;
      localStorage.setItem("userToken", token);
      commit("SET_TOKEN", token);
      commit("SET_USER", user);
      return response;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  },

  async logoutUser({ commit }) {
    try {
      const response = await api.delete("/logout", {
        headers: {
          Authorization: localStorage.getItem("userToken"),
        },
      });
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
      commit("CLEAR_USER_DATA");
      return response;
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  },

  async fetchHospedes({ commit }) {
    try {
      const response = await axios.get("http://localhost:8080/api/hospedes/listar", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      commit("SET_HOSPEDES", response.data);
    } catch (error) {
      console.error("Erro ao buscar hóspedes:", error);
      throw error;
    }
  },

  async createHospede({ commit }, hospedeData) {
    try {
      const response = await axios.post("http://localhost:8080/hospedes", hospedeData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      commit("ADD_HOSPEDE", response.data);
    } catch (error) {
      console.error("Erro ao criar hóspede:", error);
      throw error;
    }
  },

  async updateHospede({ commit }, hospedeData) {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/hospedes/${hospedeData.id}`,
        hospedeData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );
      commit("UPDATE_HOSPEDE", response.data);
    } catch (error) {
      console.error("Erro ao atualizar hóspede:", error);
      throw error;
    }
  },

  async deleteHospede({ commit }, hospedeId) {
    try {
      await axios.delete(`http://localhost:8080/api/hospedes/${hospedeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      commit("DELETE_HOSPEDE", hospedeId);
    } catch (error) {
      console.error("Erro ao deletar hóspede:", error);
      throw error;
    }
  },
  async fetchHistoricoHospedes({ commit }, flatId) {
    try {
      const response = await axios.get(`http://localhost:8080/api/flats/${flatId}/historico`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      commit("SET_HISTORICO_HOSPEDES", response.data);
    } catch (error) {
      console.error("Erro ao buscar histórico de hóspedes:", error);
      throw error;
    }
  },
};