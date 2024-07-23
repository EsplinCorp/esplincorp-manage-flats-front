<template>
  <v-container>
    <div class="mt-5"></div>

    <v-row align="center">
      <v-col cols="12" sm="auto" class="d-flex align-items-center">
        <v-icon class="mt-2" size="35">mdi-home-city</v-icon>
        <h2 class="ml-3 mt-3 font-weight-normal">Flats</h2>
      </v-col>
    </v-row>
    <v-divider class="my-3"></v-divider>

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
                  {{ formatDate(currentMonth, 'MMMM yyyy') }}
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

    <!-- Componente de diálogo para adicionar novo flat -->
    <new-flat-dialog @flatAdded="fetchFlats" ref="newFlatDialog" />
  </v-container>
</template>

<script>
import axios from "axios";
import { addMonths, subMonths, format, setMonth, startOfMonth } from "date-fns";
import { ptBR } from 'date-fns/locale';
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
      monthMenu: false,
      months: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]
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
    },
    formatDate(date, formatString) {
      return format(date, formatString, { locale: ptBR });
    },
    selectMonth(index) {
      const newDate = setMonth(this.currentMonth, index);
      this.currentMonth = startOfMonth(newDate);
      this.monthMenu = false;
    }
  }
};
</script>

<style scoped>
.font-weight-normal {
  font-weight: normal;
}

.calendar {
  margin: 0 auto;
}

.v-calendar__day--event {
  border-radius: 50%;
  border: 2px solid red;
}

.v-btn {
  margin: 0 4px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.calendar-header span {
  margin: 0 16px;
  font-weight: bold;
  font-size: 18px;
}

.calendar-month-selector {
  display: flex;
  align-items: center;
}
</style>
