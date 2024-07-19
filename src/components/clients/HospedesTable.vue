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
              <td class="d-none d-md-table-cell">{{ item.flatId }}</td>
              <td>{{ item.dataEntrada | formatDate }}</td>
              <td>{{ item.dataSaida | formatDate }}</td>
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
import { mapActions, mapState } from "vuex";
import HospedeManager from "@/views/HospedeManager.vue";
import Swal from "sweetalert2";

export default {
  components: {
    HospedeManager,
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
        { text: "Ações", value: "actions" },
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
    ]),
    getStatus(item) {
      const today = new Date().toISOString().substr(0, 10);
      return item.dataEntrada <= today && item.dataSaida >= today;
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
    confirmDeleteHospede(hospede) {
      Swal.fire({
        title: "Tem certeza?",
        text: `Deseja excluir o hóspede ${hospede.nome}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
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
