export default {
  // Define a mutação para configurar as informações do usuário
  SET_USER(state, user) {
    state.user = user;
  },

  // Define a mutação para configurar o token do usuário
  SET_TOKEN(state, token) {
    state.token = token;
  },

  // Define a mutação para limpar os dados do usuário e o token
  CLEAR_USER_DATA(state) {
    state.user = null;
    state.token = null;
  },

  // Atualiza o estado com a lista de hóspedes
  SET_HOSPEDES(state, hospedes) {
    state.hospedes = hospedes;
  },

  // Adiciona um novo hóspede ao estado
  ADD_HOSPEDE(state, hospede) {
    state.hospedes.push(hospede);
  },

  // Atualiza um hóspede existente no estado
  UPDATE_HOSPEDE(state, updatedHospede) {
    const index = state.hospedes.findIndex(h => h.id === updatedHospede.id);
    if (index !== -1) {
      state.hospedes.splice(index, 1, updatedHospede);
    }
  },

  // Remove um hóspede do estado
  DELETE_HOSPEDE(state, hospedeId) {
    state.hospedes = state.hospedes.filter(h => h.id !== hospedeId);
  },
};
