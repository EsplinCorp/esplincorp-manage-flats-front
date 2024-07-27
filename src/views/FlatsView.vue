<template>
  <v-container>
    <v-btn
      class="action-button mb-7 mt-5"
      color="primary"
      @click="openNewFlatDialog"
      rounded
      elevation="2"
    >
      Novo Flat
    </v-btn>

    <v-row>
      <v-col cols="12" md="3" class="mb-3">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Pesquisar flats"
          single-line
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-for="flat in filteredFlats" :key="flat.id" cols="12" md="4">
        <v-card
          class="custom-card mb-4"
          :class="{
            'status-occupied': flat.status === 'Ocupado',
            'status-available': flat.status === 'Disponível',
          }"
        >
          <v-card-title class="text-h6">{{ flat.nome }}</v-card-title>
          <v-card-subtitle class="font-weight-bold text-subtitle-1 mb-2">{{
            flat.local
          }}</v-card-subtitle>
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon :color="flat.status === 'Ocupado' ? 'red' : 'green'"
                    >mdi-label</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold"
                    >Status Atual</v-list-item-title
                  >
                  <v-list-item-subtitle
                    :class="
                      flat.status === 'Ocupado' ? 'text-danger' : 'text-success'
                    "
                    >{{ flat.status }}</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-map-marker</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold"
                    >Endereço</v-list-item-title
                  >
                  <v-list-item-subtitle>{{
                    flat.endereco
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-account-group</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold"
                    >Capacidade</v-list-item-title
                  >
                  <v-list-item-subtitle
                    >{{
                      flat.quantidadeHospedesSuportados
                    }}
                    hóspedes</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-currency-usd</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold"
                    >Valor da diária</v-list-item-title
                  >
                  <v-list-item-subtitle>
                    {{
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(flat.valorDiaria)
                    }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="center-actions">
            <v-btn
              @click="checkAvailability(flat.id)"
              class="edit-button mb-5 mt-2"
              text
              >Ver Disponibilidade</v-btn
            >
            <v-btn
              @click="openEditFlatDialog(flat)"
              class="edit-button mb-5 mt-2"
              text
              >Editar</v-btn
            >
            <v-btn
              @click="confirmDeleteFlat(flat)"
              class="delete-button mb-5 mt-2"
              text
              >Excluir</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de Disponibilidade -->
    <v-dialog v-model="availabilityDialog" max-width="600px">
      <v-card>
        <v-card-title class="action-button mb-7 mt-5">
          Disponibilidade do Flat
          <v-spacer></v-spacer>
          <v-btn icon @click="availabilityDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="calendar-header">
            <v-btn icon @click="prevMonth">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-menu
              v-model="monthMenu"
              :close-on-content-click="false"
              :nudge-bottom="10"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" class="calendar-month-selector">
                  {{ formatDate(currentMonth, "MMMM yyyy") }}
                  <v-icon right>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(month, index) in months"
                  :key="index"
                  @click="selectMonth(index)"
                >
                  <v-list-item-title>{{ month }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-btn icon @click="nextMonth">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
          <v-calendar
            ref="calendar"
            v-model="currentMonth"
            :events="events"
            color="primary"
            :short-intervals="true"
            :first-interval="7"
            :interval-count="10"
            :weekdays="[0, 1, 2, 3, 4, 5, 6]"
            :type="type"
            @click:date="onClickDate"
            class="calendar"
          ></v-calendar>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Componente de diálogo para adicionar/editar flat -->
    <new-flat-dialog
      @flatSaved="fetchFlats"
      :flatData="selectedFlat"
      :isEditing="isEditing"
      ref="newFlatDialog"
    />
  </v-container>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import { addMonths, subMonths, format, setMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import NewFlatDialog from "@/components/clients/NewFlatDialog.vue";

export default {
  components: {
    NewFlatDialog,
  },
  data() {
    return {
      search: "",
      flats: [],
      availabilityDialog: false,
      events: [],
      type: "month",
      currentMonth: new Date(),
      monthMenu: false,
      months: [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ],
      selectedFlat: null,
      isEditing: false,
    };
  },
  created() {
    this.fetchFlats();
  },
  methods: {
    openNewFlatDialog() {
      this.isEditing = false;
      this.selectedFlat = null;
      this.$refs.newFlatDialog.openDialog();
    },
    openEditFlatDialog(flat) {
      this.isEditing = true;
      this.selectedFlat = { ...flat };
      this.$refs.newFlatDialog.openDialog();
    },
    confirmDeleteFlat(flat) {
      Swal.fire({
        title: "Tem certeza?",
        text: `Deseja excluir o flat ${flat.nome}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#primary",
        cancelButtonColor: "#secondary",
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .delete(`http://localhost:8080/api/flats/${flat.id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
              },
            })
            .then(() => {
              Swal.fire({
                title: "Excluído!",
                text: "O flat foi excluído com sucesso.",
                icon: "success",
                showConfirmButton: false,
                timer: 1200,
              });
              this.fetchFlats();
            })
            .catch((error) => {
              console.error("Erro ao excluir flat:", error);
              Swal.fire("Erro!", "Não foi possível deletar o flat.", "error");
            });
        }
      });
    },
    fetchFlats() {
      axios
        .get("http://localhost:8080/api/flats/listar", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        })
        .then((response) => {
          const flats = response.data;
          axios
            .get("http://localhost:8080/api/hospedes/listar", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
              },
            })
            .then((response) => {
              const hospedes = response.data;
              flats.forEach((flat) => {
                const isOccupied = hospedes.some(
                  (hospede) =>
                    hospede.flatId === flat.id &&
                    new Date(hospede.dataEntrada) <= new Date() &&
                    new Date(hospede.dataSaida) >= new Date(),
                );
                flat.status = isOccupied ? "Ocupado" : "Disponível";
              });
              this.flats = flats;
            })
            .catch((error) => {
              console.error("Erro ao buscar hóspedes:", error);
            });
        })
        .catch((error) => {
          console.error("Erro ao buscar flats:", error);
        });
    },
    checkAvailability(flatId) {
      axios
        .get("http://localhost:8080/api/hospedes/listar", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        })
        .then((response) => {
          const hospedes = response.data;
          const reservedDates = hospedes
            .filter((hospede) => hospede.flatId === flatId)
            .map((hospede) => ({
              name: `Reservado para ${hospede.nome}`,
              start: new Date(hospede.dataEntrada),
              end: new Date(hospede.dataSaida),
              color: "red",
            }));

          this.events = reservedDates;
          this.availabilityDialog = true;
        })
        .catch((error) => {
          console.error("Erro ao buscar hóspedes:", error);
        });
    },
    prevMonth() {
      this.currentMonth = subMonths(this.currentMonth, 1);
    },
    nextMonth() {
      this.currentMonth = addMonths(this.currentMonth, 1);
    },
    onClickDate(date) {
      console.log("Date clicked:", date);
    },
    formatDate(date, formatString) {
      return format(date, formatString, { locale: ptBR });
    },
    selectMonth(index) {
      const newDate = setMonth(this.currentMonth, index);
      this.currentMonth = startOfMonth(newDate);
      this.monthMenu = false;
    },
  },
  computed: {
    filteredFlats() {
      if (!this.search) {
        return this.flats;
      }
      const searchTerm = this.search.toLowerCase();
      return this.flats.filter((flat) => {
        return (
          flat.nome.toLowerCase().includes(searchTerm) ||
          flat.local.toLowerCase().includes(searchTerm) ||
          flat.endereco.toLowerCase().includes(searchTerm) ||
          flat.status.toLowerCase().includes(searchTerm)
        );
      });
    },
  },
};
</script>

<style scoped>
.v-card,
.custom-card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
}

.v-card:hover,
.custom-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3) !important;
  transform: translateY(-10px);
}

.dark-mode .v-card,
.dark-mode .custom-card {
  box-shadow: 0 px 15px rgba(255, 255, 255, 0.2) !important;
}

.dark-mode .v-card:hover,
.dark-mode .custom-card:hover {
  box-shadow: 0 8px 30px rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-10px);
}
.center-actions {
  display: flex;
  justify-content: right;
}
</style>
