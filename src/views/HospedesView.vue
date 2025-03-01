<template>
  <v-row justify="center">
    <v-col cols="12" md="10" lg="12">
      <v-container class="container-color">
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

          <v-col cols="12" md="3" class="mb-7">
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
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="checkInDate"
                @input="menuCheckIn = false"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" md="3" class="mb-7">
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
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="checkOutDate"
                @input="menuCheckOut = false"
              ></v-date-picker>
            </v-menu>
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
                      <span v-html="octicons['pencil'].toSVG({ class: 'octicon', style: 'fill: var(--primary-color);'})"></span>
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
                    <span v-html="octicons['trash'].toSVG({ class: 'octicon', style: 'fill: var(--primary-color);'})"></span>
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as octicons from "@primer/octicons";

export default {
  components: {
    HospedesTable,
  },
  data() {
    return {
      search: "",
      statusFilter: ["Hospedado", "Reservado"],
      checkInDate: "",
      checkOutDate: "",
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
        { text: "Ações", value: "actions", sortable: false },
      ],
      octicons,
    };
  },
  computed: {
    ...mapState(["hospedes"]),
    filteredHospedes() {
      const today = new Date().toISOString().split("T")[0];
      const normalizedSearch = this.search.toLowerCase();
      
      // Processamento melhorado das datas para evitar problemas de fuso horário
      const checkInDate = this.checkInDate ? this.normalizeDate(this.checkInDate) : null;
      const checkOutDate = this.checkOutDate ? this.normalizeDate(this.checkOutDate) : null;

      return this.hospedes.filter((hospede) => {
        // Normaliza as datas do hóspede para comparação correta
        const hospedeCheckIn = this.normalizeHospedeDate(hospede.dataEntrada);
        const hospedeCheckOut = this.normalizeHospedeDate(hospede.dataSaida);

        // Verifica se o hóspede já foi hospedado
        const wasHosted = !hospedeCheckOut || hospedeCheckOut > today;

        // Lógica de filtro de datas melhorada
        let dateInRange = true;
        
        if (checkInDate && hospedeCheckIn) {
          // Comparar apenas as datas sem o componente de tempo
          dateInRange = dateInRange && (hospedeCheckIn >= checkInDate);
        }
        
        if (checkOutDate && hospedeCheckOut && dateInRange) {
          // Comparar apenas as datas sem o componente de tempo
          dateInRange = dateInRange && (hospedeCheckOut <= checkOutDate);
        }

        // Verifica se a pesquisa corresponde a qualquer valor do hóspede
        const matchesSearch = Object.values(hospede).some((value) =>
          value !== null && String(value).toLowerCase().includes(normalizedSearch)
        );

        return wasHosted && dateInRange && matchesSearch;
      });
    },
  },
  filters: {
    formatDate(value) {
      if (!value) return "";
      
      try {
        // Se a data já estiver no formato brasileiro, retorne como está
        if (typeof value === 'string' && value.includes('/')) {
          return value;
        }
        
        // Se a data estiver no formato ISO
        if (typeof value === 'string' && value.includes('-')) {
          // Extrair componentes da data
          const [year, month, day] = value.split('-');
          // Horário meio-dia para evitar problemas de fuso horário
          const date = new Date(year, month - 1, parseInt(day), 12, 0, 0);
          return format(date, "dd/MM/yyyy", { locale: ptBR });
        }
        
        // Para objetos Date
        const date = new Date(value);
        date.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de fuso horário
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      } catch (error) {
        console.error("Erro ao formatar data:", error);
        return "";
      }
    }
  },
  methods: {
    ...mapActions(["fetchHospedes", "deleteHospede"]),
    
    // Método para normalizar datas para comparação adequada
    normalizeDate(dateString) {
      if (!dateString) return null;
      
      // Retornar a parte da data em formato YYYY-MM-DD
      if (dateString.includes('-')) {
        return dateString.split('T')[0];
      }
      
      // Converter formato brasileiro para ISO
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      return dateString;
    },
    
    // Normaliza a data do hóspede para comparação
    normalizeHospedeDate(dateString) {
      if (!dateString) return null;
      
      // Se a data estiver no formato brasileiro (DD/MM/YYYY)
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Se a data estiver no formato ISO com timestamp
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      
      return dateString;
    },
    
    formatDate(value) {
      if (!value) return "";
      
      try {
        // Se a data já estiver no formato brasileiro, retorne como está
        if (typeof value === 'string' && value.includes('/')) {
          return value;
        }
        
        // Se a data estiver no formato ISO
        if (typeof value === 'string' && value.includes('-')) {
          // Extrair componentes da data
          const [year, month, day] = value.split('-');
          // Horário meio-dia para evitar problemas de fuso horário
          const date = new Date(year, month - 1, parseInt(day), 12, 0, 0);
          return format(date, "dd/MM/yyyy", { locale: ptBR });
        }
        
        // Para objetos Date
        const date = new Date(value);
        date.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de fuso horário
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      } catch (error) {
        console.error("Erro ao formatar data:", error);
        return "";
      }
    },
    
    filterGuests() {
      // Filtrando hóspedes com base no status
      this.filteredGuests = this.guests.filter((guest) =>
        this.statusFilter.includes(guest.status),
      );
    },
    getStatus(item) {
      const today = new Date().toISOString().split("T")[0];
      let checkInDate, checkOutDate;
      
      // Processar data de check-in
      checkInDate = this.normalizeHospedeDate(item.dataEntrada) || today;
      
      // Processar data de check-out
      checkOutDate = this.normalizeHospedeDate(item.dataSaida) || today;

      if (checkInDate <= today && checkOutDate >= today) {
        return { text: "Hospedado", color: "teal" };
      } else if (checkInDate > today) {
        return { text: "Reserva Confirmada", color: "indigo" };
      }
      return { text: "Não Hospedado", color: "grey-draken-2" };
    },
    
    openNewHospedeDialog() {
      this.$refs.hospedesTable.openDialog();
    },
    
    editarHospede(hospede) {
      this.$refs.hospedesTable.openDialog(true);
      this.$nextTick(() => {
        // Cria uma cópia do hóspede para manipulação segura
        const hospedeCopy = { ...hospede };
        
        // Formatar datas para o formato ISO para os inputs do tipo date
        if (hospedeCopy.dataEntrada) {
          hospedeCopy.dataEntrada = this.normalizeHospedeDate(hospedeCopy.dataEntrada);
        }
        
        if (hospedeCopy.dataSaida) {
          hospedeCopy.dataSaida = this.normalizeHospedeDate(hospedeCopy.dataSaida);
        }
        
        this.$refs.hospedesTable.hospede = hospedeCopy;
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
  font-size: 0.80rem;
  height: auto;
  padding: 0.25rem;
  border-radius: 7px;
}
.small-text .v-data-table-header th,
.small-text .v-data-table__wrapper td {
  font-size: 0.875rem;
  padding: 5px 5px;
}
.text-left {
  text-align: left;
}

</style>