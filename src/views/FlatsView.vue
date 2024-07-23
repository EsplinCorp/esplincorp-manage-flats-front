<template>
  <v-container>
    <div class="mt-5"></div>

    <v-row align="center">
      <v-col cols="12" sm="auto" class="d-flex align-items-center">
        <v-icon class="mt-2" size="35">mdi-home-city</v-icon>
        <h2 class="ml-3 mt-3 font-weight-normal">Flats</h2>
      </v-col>
    </v-row>
    <v-divider class="my-3" :style="{ backgroundColor: 'tertiary' }"></v-divider>

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
      <v-col v-for="flat in flats" :key="flat.id" cols="12" md="4">
        <v-card>
          <v-card-title>{{ flat.nome }}</v-card-title>
          <v-card-subtitle>{{ flat.local }}</v-card-subtitle>
          <v-card-text>
            <p>Endereço: {{ flat.endereco }}</p>
            <p>Capacidade: {{ flat.quantidadeHospedesSuportados }} hóspedes</p>
            <p>Disponíveis: {{ flat.quantidadeFlatsDisponiveis }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="checkAvailability(flat.id)" color="primary">Ver Disponibilidade</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de Disponibilidade -->
    <v-dialog v-model="availabilityDialog" max-width="600px">
      <v-card>
        <v-card-title>
          Disponibilidade do Flat
          <v-spacer></v-spacer>
          <v-btn icon @click="availabilityDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
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
          ></v-calendar>
          <v-row justify="center" class="mt-2">
            <v-btn icon @click="prevMonth">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn icon @click="nextMonth">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Componente de diálogo para adicionar novo flat -->
    <new-flat-dialog @flatAdded="fetchFlats" ref="newFlatDialog" />
  </v-container>
</template>

<script>
import axios from "axios";
import { addMonths, subMonths } from "date-fns";
import NewFlatDialog from '@/components/clients/NewFlatDialog.vue';

export default {
  components: {
    NewFlatDialog
  },
  data() {
    return {
      flats: [],
      availabilityDialog: false,
      events: [],
      type: 'month',
      currentMonth: new Date(),
    };
  },
  created() {
    this.fetchFlats();
  },
  methods: {
    openNewFlatDialog() {
      this.$refs.newFlatDialog.openDialog();
    },
    fetchFlats() {
      axios
        .get("http://localhost:8080/api/flats/listar", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        })
        .then(response => {
          this.flats = response.data;
        })
        .catch(error => {
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
        .then(response => {
          const hospedes = response.data;
          const reservedDates = hospedes
            .filter(hospede => hospede.flatId === flatId)
            .map(hospede => ({
              name: `Reservado para ${hospede.nome}`,
              start: new Date(hospede.dataEntrada),
              end: new Date(hospede.dataSaida),
              color: 'red',
            }));

          this.events = reservedDates;
          this.availabilityDialog = true;
        })
        .catch(error => {
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
    }
  }
};
</script>

<style scoped>
.font-weight-normal {
  font-weight: normal;
}
</style>
