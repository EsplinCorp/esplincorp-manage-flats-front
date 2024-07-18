import api from '@/services/api/api.js';
import axios from 'axios';

export default {
  loginUser({ commit }, credentials) {
    return new Promise((resolve, reject) => {
      api.post('/login', credentials)
        .then(response => {
          const token = response.data.token;
          const user = response.data.user;
          localStorage.setItem('userToken', token);
          commit('SET_TOKEN', token);
          commit('SET_USER', user);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  logoutUser({ commit }) {
    return new Promise((resolve, reject) => {
      api.delete('/logout', {
        headers: {
          'Authorization': localStorage.getItem('userToken')
        }
      })
        .then(response => {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userInfo');
          commit('CLEAR_USER_DATA');
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchHospedes({ commit }) {
    return axios.get('http://localhost:8080/api/hospedes/listar', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      }
    })
      .then(response => {
        commit('SET_HOSPEDES', response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar hóspedes:', error);
        throw error;
      });
  },


  createHospede({ commit }, hospedeData) {
    return axios.post('http://localhost:8080/hospedes', hospedeData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      }
    })
      .then(response => {
        commit('ADD_HOSPEDE', response.data);
      })
      .catch(error => {
        console.error('Erro ao criar hóspede:', error);
      });
  },

  updateHospede({ commit }, hospedeData) {
    return axios.put(`http://localhost:8080/api/hospedes/${hospedeData.id}`, hospedeData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      }
    })
      .then(response => {
        commit('UPDATE_HOSPEDE', response.data);
      })
      .catch(error => {
        console.error('Erro ao atualizar hóspede:', error);
        throw error; // Propaga o erro para lidar com ele no componente Vue.js
      });
  },


  deleteHospede({ commit }, hospedeId) {
    return axios.delete(`http://localhost:8080/api/hospedes/${hospedeId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      }
    })
      .then(() => {
        commit('DELETE_HOSPEDE', hospedeId); // Remove localmente após sucesso no backend
      })
      .catch(error => {
        console.error('Erro ao deletar hóspede:', error);
        throw error; // Propaga o erro para lidar com ele no componente Vue.js
      });
  }
};
