<template>
  <v-row justify="center">
    <v-col cols="12" md="10" lg="12">
      <v-container>
        <!-- Espaçamento no topo -->
        <div class="mt-5"></div>

        <!-- Título Hóspedes com ícone -->
        <v-row align="center">
          <v-col cols="12" sm="auto" class="d-flex align-items-center">
            <v-icon large>mdi-account-group</v-icon>
            <h2 class="ml-2 mb-0 font-weight-normal">Hóspedes</h2>
          </v-col>
        </v-row>

        <!-- Linha horizontal personalizada -->
        <v-divider class="my-3" :style="{ backgroundColor: '' }"></v-divider>

        <!-- Botão de Novo Hóspede -->
        <v-btn
          class="action-button mb-7 mt-5"
          color=""
          @click="openNewHospedeDialog"
        >
          Novo Hóspede
        </v-btn>
        <hospede-manager ref="hospedeManager"></hospede-manager>

        <!-- Tabela de Hóspedes -->
        <v-data-table
          :headers="headers"
          :items="filteredHospedes"
          :loading="loading"
          class="elevation-1"
          mobile-breakpoint="500"
          dense
          item-key="id"
        >
          <template v-slot:item="{ item }">
            <tr>
              <td>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      :color="getStatus(item) ? 'green' : 'grey'"
                      v-bind="attrs"
                      v-on="on"
                      class="d-flex align-center justify-center"
                    >
                      {{
                        getStatus(item)
                          ? "mdi-account-check"
                          : "mdi-account-cancel"
                      }}
                    </v-icon>
                  </template>
                  <span>{{
                    getStatus(item) ? "Hospedado" : "Não Hospedado"
                  }}</span>
                </v-tooltip>
              </td>
              <td>{{ item.id }}</td>
              <td>{{ item.nome }}</td>
              <td class="d-none d-md-table-cell">{{ item.cpfOuCnpj }}</td>
              <td class="d-none d-md-table-cell">{{ item.email }}</td>
              <td class="d-none d-md-table-cell">{{ item.telefone }}</td>
              <td class="d-none d-md-table-cell">{{ item.localHospedagem }}</td>
              <td>{{ item.dataCheckIn | formatDate }}</td>
              <td>{{ item.dataCheckOut | formatDate }}</td>
              <td>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      v-bind="attrs"
                      v-on="on"
                      @click="editarHospede(item)"
                    >
                      <v-icon>mdi-pencil-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Editar Hóspede</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      v-bind="attrs"
                      v-on="on"
                      @click="openDeleteDialog(item)"
                    >
                      <v-icon>mdi-delete-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Excluir Hóspede</span>
                </v-tooltip>
              </td>
            </tr>
          </template>
        </v-data-table>

        <!-- Diálogo de Confirmação de Exclusão -->
        <v-dialog v-model="deleteDialog" persistent max-width="500px">
          <v-card>
            <v-card-title class="d-flex justify-space-between">
              Excluir Hóspede
              <v-btn icon @click="closeDeleteDialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              Você tem certeza que deseja excluir o hóspede
              <strong>{{ selectedHospede?.nome }}</strong
              >?
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="delete-button" text @click="deletarHospede">
                Excluir Hóspede
              </v-btn>
              <v-btn class="cancel-button" text @click="closeDeleteDialog">
                Cancelar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
import { mapActions, mapState } from "vuex";
import HospedeManager from "@/views/HospedeManager.vue";

export default {
  components: {
    HospedeManager,
  },
  data() {
    return {
      deleteDialog: false,
      selectedHospede: null,
      loading: false,
      headers: [
        { text: "Status", value: "status", sortable: false },
        { text: "ID", value: "id" },
        { text: "Nome", value: "nome" },
        { text: "CPF/CNPJ", value: "cpfOuCnpj" },
        { text: "Email", value: "email" },
        { text: "Telefone", value: "telefone" },
        { text: "Local", value: "localHospedagem" },
        { text: "Check-in", value: "dataCheckIn" },
        { text: "Check-out", value: "dataCheckOut" },
        { text: "Ações", value: "actions" },
      ],
    };
  },
  computed: {
    ...mapState(["hospedes"]),
    filteredHospedes() {
      // Retorna todos os hóspedes sem filtro de status
      return this.hospedes;
    },
  },
  methods: {
    ...mapActions([
      "fetchHospedes",
      "deleteHospede",
      "createHospede",
      "updateHospede",
    ]),
    // Função para determinar o status do hóspede
    getStatus(item) {
      const today = new Date().toISOString().substr(0, 10);
      if (item.dataCheckIn <= today && item.dataCheckOut >= today) {
        return true; // Hóspede está no flat
      } else {
        return false; // Hóspede não está no flat
      }
    },
    openNewHospedeDialog() {
      this.$refs.hospedeManager.openDialog();
    },
    editarHospede(hospede) {
      this.$refs.hospedeManager.openDialog(true);
      this.$nextTick(() => {
        this.$refs.hospedeManager.hospede = { ...hospede };
      });
    },
    openDeleteDialog(hospede) {
      this.selectedHospede = hospede;
      this.deleteDialog = true;
    },
    closeDeleteDialog() {
      this.deleteDialog = false;
      this.selectedHospede = null;
    },
    deletarHospede() {
      if (this.selectedHospede) {
        this.loading = true;
        this.deleteHospede(this.selectedHospede.id)
          .then(() => {
            this.closeDeleteDialog();
            this.fetchHospedes();
          })
          .catch((error) => {
            console.error("Erro ao excluir o hóspede:", error);
            if (error.response && error.response.status === 401) {
              this.$router.push("/login");
              alert("Sessão expirada, por favor faça login novamente.");
            } else {
              alert("Erro ao excluir o hóspede. Por favor, tente novamente.");
            }
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
  },
  filters: {
    formatDate(value) {
      if (value) {
        const date = new Date(value);
        date.setDate(date.getDate() + 1); // Adiciona 1 dia à data
        return new Intl.DateTimeFormat("pt-BR").format(date);
      }
    },
  },
  created() {
    this.fetchHospedes();
  },
};
</script>

<style scoped>
/* Estilos personalizados podem ser adicionados aqui */
</style>
