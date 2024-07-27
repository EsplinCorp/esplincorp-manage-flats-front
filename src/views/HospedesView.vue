<template>
  <v-row justify="center">
    <v-col cols="12" md="10" lg="12">
      <v-container>
        <v-btn
          class="action-button mb-5 mt-5"
          color="primary"
          @click="openNewHospedeDialog"
          rounded
          elevation="2"
        >
          Novo Hóspede
        </v-btn>
        <hospedes-table ref="hospedesTable"></hospedes-table>

        <v-row>
          <v-col cols="12" md="3" class="mb-7">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Pesquisar hóspedes"
              single-line
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="filteredHospedes"
          :loading="loading"
          class="elevation-1 small-text"
          mobile-breakpoint="500"
          dense
          item-key="id"
        >
          <template v-slot:item="{ item }">
            <tr>
              <td>
                <v-chip :color="getStatus(item).color" dark class="small-chip">
                  {{ getStatus(item).text }}
                </v-chip>
              </td>
              <td>{{ item.nome }}</td>
              <td class="d-none d-md-table-cell">{{ item.cpf }}</td>
              <td class="d-none d-md-table-cell">{{ item.email }}</td>
              <td class="d-none d-md-table-cell">{{ item.telefone }}</td>
              <td>{{ item.dataEntrada | formatDate }}</td>
              <td>{{ item.dataSaida | formatDate }}</td>
              <td class="d-none d-md-table-cell">{{ item.flatName }}</td>
              <td class="d-none d-md-table-cell text-left">
                {{
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.valorTotal)
                }}
              </td>
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
      loading: false,
      headers: [
        { text: "Status", value: "status", sortable: false },
        { text: "Nome", value: "nome" },
        { text: "CPF/CNPJ", value: "cpf" },
        { text: "Email", value: "email" },
        { text: "Telefone", value: "telefone" },
        { text: "Check-in", value: "dataEntrada" },
        { text: "Check-out", value: "dataSaida" },
        { text: "Local", value: "localHospedagem" },
        { text: "Total", value: "valorTotal" },
        { text: "Ações", value: "actions", sortable: false },
      ],
    };
  },
  computed: {
    ...mapState(["hospedes"]),
    filteredHospedes() {
      const today = new Date().toISOString().substr(0, 10);
      return this.hospedes.filter((hospede) => {
        const checkOutDate = new Date(hospede.dataSaida)
          .toISOString()
          .substr(0, 10);
        return (
          checkOutDate >= today &&
          (Object.values(hospede).some((value) =>
            String(value).toLowerCase().includes(this.search.toLowerCase()),
          ) ||
            this.getStatus(hospede)
              .text.toLowerCase()
              .includes(this.search.toLowerCase()))
        );
      });
    },
  },
  methods: {
    ...mapActions(["fetchHospedes", "deleteHospede"]),
    getStatus(item) {
      const today = new Date().toISOString().substr(0, 10);
      const checkInDate = new Date(item.dataEntrada)
        .toISOString()
        .substr(0, 10);
      const checkOutDate = new Date(item.dataSaida).toISOString().substr(0, 10);
      if (checkInDate <= today && checkOutDate >= today) {
        return { text: "Hospedado", color: "green" };
      } else if (checkInDate > today) {
        return { text: "Reservado", color: "orange" };
      }
      return { text: "Não Hospedado", color: "grey" };
    },
    openNewHospedeDialog() {
      this.$refs.hospedesTable.openDialog();
    },
    editarHospede(hospede) {
      this.$refs.hospedesTable.openDialog(true);
      this.$nextTick(() => {
        const dataEntrada = new Date(hospede.dataEntrada);
        const dataSaida = new Date(hospede.dataSaida);
        this.$refs.hospedesTable.hospede = {
          ...hospede,
          dataEntrada: dataEntrada.toISOString().split("T")[0],
          dataSaida: dataSaida.toISOString().split("T")[0],
        };
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
          Swal.fire({
            title: "Excluído!",
            text: "O hóspede foi excluído com sucesso.",
            icon: "success",
            showConfirmButton: false,
            timer: 1200,
          });
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
  },
  created() {
    this.fetchHospedes();
  },
};
</script>

<style scoped>
.small-chip {
  font-size: 0.75rem;
  height: auto;
  padding: 0.25rem;
  border-radius: 6px;
}
.small-text .v-data-table-header th,
.small-text .v-data-table__wrapper td {
  font-size: 0.875rem;
  padding: 8px 16px;
}
.text-left {
  text-align: left;
}
</style>
