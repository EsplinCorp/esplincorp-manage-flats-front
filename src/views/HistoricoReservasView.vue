<template>
  <v-row justify="center">
    <v-col cols="12" md="10" lg="12">
      <v-container class="container-color">
        <hospedes-table ref="hospedesTable"></hospedes-table>

        <v-row class="mb-7 mt-3">
          <v-col cols="12" md="3" class="py-0">
            <v-text-field
              v-model="search"
              :append-icon="null"
              label="Pesquisar hóspedes"
              single-line
              hide-details
              dense
            >
              <template v-slot:append>
                <span
                  v-html="octicons.search.toSVG({ class: 'octicon' })"
                ></span>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="12" md="3" class="py-0">
            <v-menu
              v-model="menuCheckIn"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="formatDate(checkInDate)"
                  label="Data de Check-in"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  dense
                  hide-details
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="checkInDate"
                @input="menuCheckIn = false"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" md="3" class="py-0">
            <v-menu
              v-model="menuCheckOut"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="formatDate(checkOutDate)"
                  label="Data de Check-out"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  dense
                  hide-details
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="checkOutDate"
                @input="menuCheckOut = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="2" class="py-0">
            <v-select
              v-model="flatFilter"
              :items="flats"
              item-text="nome"
              item-value="id"
              label="Filtrar por Flat"
              clearable
              dense
              hide-details
            >
              <template v-slot:no-data>
                <v-alert type="info" text class="mt-3">
                  Nenhum flat encontrado
                </v-alert>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="auto" class="d-flex align-center py-0">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  @click="limparFiltros"
                  color="primary"
                >
                  <span
                    v-html="
                      octicons['filter-remove'].toSVG({ class: 'octicon' })
                    "
                  ></span>
                </v-btn>
              </template>
              <span>Limpar Filtro</span>
            </v-tooltip>
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
              <td>{{ formatDate(item.dataEntrada) }}</td>
              <td>{{ formatDate(item.dataSaida) }}</td>
              <td class="d-none d-md-table-cell">{{ item.flatName }}</td>
              <td class="d-none d-md-table-cell text-left">
                {{
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.valorTotal)
                }}
              </td>
            </tr>
          </template>
          <template #no-data>
            <v-alert type="info" text> Nenhuma hospedagem encontrada </v-alert>
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import axios from "axios";
import * as octicons from "@primer/octicons";

export default {
  components: {
    HospedesTable,
  },
  data() {
    return {
      search: "",
      checkInDate: "",
      checkOutDate: "",
      flatFilter: null,
      statusFilter: null,
      statusOptions: [
        "Hospedado",
        "Reserva Confirmada",
        "Hospedagem Concluída",
      ],
      flats: [],
      menuCheckIn: false,
      menuCheckOut: false,
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
      ],
      octicons,
    };
  },
  computed: {
    ...mapState(["hospedes"]),
    filteredHospedes() {
      const today = new Date().toISOString().split("T")[0];
      const normalizedSearch = this.search.toLowerCase();
      const checkInDate = this.checkInDate
        ? new Date(this.checkInDate.split("/").reverse().join("-"))
            .toISOString()
            .split("T")[0]
        : null;
      const checkOutDate = this.checkOutDate
        ? new Date(this.checkOutDate.split("/").reverse().join("-"))
            .toISOString()
            .split("T")[0]
        : null;

      return this.hospedes.filter((hospede) => {
        const hospedeCheckIn = new Date(hospede.dataEntrada)
          .toISOString()
          .split("T")[0];
        const hospedeCheckOut = new Date(hospede.dataSaida)
          .toISOString()
          .split("T")[0];

        // Verifica se o hóspede já foi hospedado
        const wasHosted = hospedeCheckOut < today;

        // Verifica se as datas de check-in e check-out estão dentro do intervalo definido
        const dateInRange =
          (!checkInDate || hospedeCheckIn >= checkInDate) &&
          (!checkOutDate || hospedeCheckOut <= checkOutDate);

        // Verifica se o flat corresponde ao filtro
        const matchesFlat = this.flatFilter
          ? hospede.flatId === this.flatFilter
          : true;

        // Verifica o status do hóspede
        const status = this.getStatus(hospede).text;
        const matchesStatus = this.statusFilter
          ? status === this.statusFilter
          : true;

        // Verifica se a pesquisa corresponde a qualquer valor do hóspede
        const matchesSearch = Object.values(hospede).some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );

        return (
          wasHosted &&
          dateInRange &&
          matchesSearch &&
          matchesFlat &&
          matchesStatus
        );
      });
    },
  },
  methods: {
    ...mapActions(["fetchHospedes", "deleteHospede"]),
    formatDate(value) {
      if (value) {
        return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
      }
      return "";
    },
    getStatus(item) {
      const today = new Date().toISOString().split("T")[0];
      const checkInDate = new Date(item.dataEntrada)
        .toISOString()
        .split("T")[0];
      const checkOutDate = new Date(item.dataSaida).toISOString().split("T")[0];

      if (checkInDate <= today && checkOutDate >= today) {
        return { text: "Hospedado", color: "teal" };
      } else if (checkInDate > today) {
        return { text: "Reserva Confirmada", color: "indigo" };
      }
      return { text: "Hospedagem Concluída", color: "green" };
    },
    openNewHospedeDialog() {
      this.$refs.hospedesTable.openDialog();
    },
    editarHospede(hospede) {
      this.$refs.hospedesTable.openDialog(true);
      this.$nextTick(() => {
        const dataEntrada = this.formatDate(hospede.dataEntrada);
        const dataSaida = this.formatDate(hospede.dataSaida);
        this.$refs.hospedesTable.hospede = {
          ...hospede,
          dataEntrada,
          dataSaida,
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
      this.deleteHospede(hospede.id).then(() => {
        Swal.fire(
          "Excluído!",
          `O hóspede ${hospede.nome} foi excluído.`,
          "success",
        );
      });
    },
    limparFiltros() {
      this.search = "";
      this.checkInDate = "";
      this.checkOutDate = "";
      this.flatFilter = null;
      this.statusFilter = null;
    },
    carregarFlats() {
      this.loading = true;

      // Implementação com axios para buscar os flats do banco
      axios
        .get("https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/flats/listar", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        })
        .then((response) => {
          this.flats = response.data;
        })
        .catch((error) => {
          console.error("Erro ao carregar flats:", error);
          // Não usar dados de exemplo
          this.flats = [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  created() {
    this.fetchHospedes();
    this.carregarFlats();
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
