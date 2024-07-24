<template>
  <v-row justify="center">
    <v-col cols="12" md="10" lg="12">
      <v-container>
        <!-- Espaçamento no topo -->
        <div class="mt-5"></div>

        <!-- Título Hóspedes com ícone -->
        <v-row align="center">
          <v-col cols="12" sm="auto" class="d-flex align-items-center">
            <v-icon class="mt-2" size="35" color="primary"
              >mdi-account-group</v-icon
            >
            <h2 class="ml-3 mt-3 font-weight-normal primary--text">Hóspedes</h2>
          </v-col>
        </v-row>

        <!-- Linha horizontal personalizada -->
        <v-divider class="my-3" :style="{ backgroundColor: '' }"></v-divider>

        <!-- Botão de Novo Hóspede -->
        <v-btn
          class="action-button mb-7 mt-5"
          color="primary"
          @click="openNewHospedeDialog"
          rounded
          elevation="2"
        >
          Novo Hóspede
        </v-btn>
        <hospedes-table ref="hospedesTable"></hospedes-table>

        <!-- Campo de Pesquisa -->
        <v-row justify="center">
          <v-col cols="12" md="8" class="mb-7">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Pesquisar hóspedes"
              single-line
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

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
              <!-- <td>{{ item.id }}</td> -->
              <td>{{ item.nome }}</td>
              <td class="d-none d-md-table-cell">{{ item.cpf }}</td>
              <td class="d-none d-md-table-cell">{{ item.email }}</td>
              <td class="d-none d-md-table-cell">{{ item.telefone }}</td>
              <td class="d-none d-md-table-cell">{{ item.flatName }}</td>
              <td>{{ item.dataEntrada | formatDate }}</td>
              <td>{{ item.dataSaida | formatDate }}</td>
              <td>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      class="edit-icon"
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
                      class="delete-icon"
                      icon
                      v-bind="attrs"
                      v-on="on"
                      @click="confirmDeleteHospede(item)"
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
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
import HospedesTable from "../components/clients/HospedesTable.vue";
import { mapActions, mapState } from "vuex";
import Swal from "sweetalert2";

export default {
  components: {
    HospedesTable,
  },
  data() {
    return {
      search: "",
      selectedHospede: null,
      loading: false,
      headers: [
        { text: "Status", value: "status", sortable: false },
        { text: "Nome", value: "nome" },
        { text: "CPF/CNPJ", value: "cpf" },
        { text: "Email", value: "email" },
        { text: "Telefone", value: "telefone" },
        { text: "Local", value: "localHospedagem" },
        { text: "Check-in", value: "dataEntrada" },
        { text: "Check-out", value: "dataSaida" },
        { text: "Ações", value: "actions", sortable: false },
      ],
    };
  },
  computed: {
    ...mapState(["hospedes"]),
    filteredHospedes() {
      if (this.search) {
        return this.hospedes.filter((hospede) =>
          Object.values(hospede).some((value) =>
            String(value).toLowerCase().includes(this.search.toLowerCase()),
          ),
        );
      }
      return this.hospedes;
    },
  },
  methods: {
    ...mapActions([
      "fetchHospedes",
      "deleteHospede",
      "createHospede",
      "updateHospede",
      "fetchFlats", // map the fetchFlats action
    ]),
    getStatus(item) {
      const today = new Date().toISOString().substr(0, 10);
      return item.dataEntrada <= today && item.dataSaida >= today;
    },
    openNewHospedeDialog() {
      this.$refs.hospedesTable.openDialog();
    },
    editarHospede(hospede) {
      this.$refs.hospedesTable.openDialog(true);
      this.$nextTick(() => {
        this.$refs.hospedesTable.hospede = { ...hospede };
      });
    },
    confirmDeleteHospede(hospede) {
      Swal.fire({
        title: "Tem certeza?",
        text: `Deseja excluir o hóspede ${hospede.nome}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#primary",
        cancelButtonColor: "#secondary",
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          this.deletarHospede(hospede);
        }
      });
    },
    deletarHospede(hospede) {
      this.loading = true;
      this.deleteHospede(hospede.id)
        .then(() => {
          Swal.fire(
            "Excluído!",
            "O hóspede foi excluído com sucesso.",
            "success",
          );
          this.fetchHospedes();
        })
        .catch((error) => {
          console.error("Erro ao excluir o hóspede:", error);
          if (error.response && error.response.status === 401) {
            this.$router.push("/login");
            Swal.fire(
              "Sessão expirada",
              "Por favor, faça login novamente.",
              "error",
            );
          } else {
            Swal.fire(
              "Erro",
              "Erro ao excluir o hóspede. Por favor, tente novamente.",
              "error",
            );
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    showSuccessMessage(message) {
      Swal.fire({
        icon: "success",
        title: "Sucesso",
        text: message,
        timer: 3000,
        showConfirmButton: false,
      });
    },
    showEditSuccessMessage() {
      this.showSuccessMessage("Hóspede editado com sucesso!");
    },
    showCreateSuccessMessage() {
      this.showSuccessMessage("Hóspede cadastrado com sucesso!");
    },
    createHospede(hospedeData) {
      this.loading = true;
      this.createHospede(hospedeData)
        .then(() => {
          this.showCreateSuccessMessage();
          this.fetchHospedes();
        })
        .catch((error) => {
          console.error("Erro ao cadastrar hóspede:", error);
          // lógica para tratar erros
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateHospede(hospedeData) {
      this.loading = true;
      this.updateHospede(hospedeData)
        .then(() => {
          this.showEditSuccessMessage();
          this.fetchHospedes();
        })
        .catch((error) => {
          console.error("Erro ao editar hóspede:", error);
          // lógica para tratar erros
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  mounted() {
    this.loading = true;
    this.fetchHospedes()
      .then(() => this.fetchFlats()) 
      .catch((error) => {
        console.error("Erro ao buscar hóspedes:", error);
      })
      .finally(() => {
        this.loading = false;
      });
  },
};
</script>

<style scoped>

</style>
