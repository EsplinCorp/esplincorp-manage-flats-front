<!-- eslint-disable -->

<template>
  <v-container>
    <div class="mt-7">
      <h2 class="ml-2 mt-3 font-weight-normal">Dashboard</h2>

      <!-- Cards de Resumo Financeiro -->
      <v-row class="mt-5">
        <v-col cols="12" md="4">
          <v-card class="resumo-card receitas-card" elevation="3">
            <v-card-title class="white--text">
              <v-icon large left color="white">mdi-cash-plus</v-icon>
              Receitas do Mês
            </v-card-title>
            <v-card-text class="text-center">
              <div class="text-h4 mt-2">
                {{ formatCurrency(totalReceitasMes) }}
              </div>
              <div class="text-subtitle-1 mt-2">
                <v-chip small color="green" text-color="white" class="mr-1">
                  <v-icon small left>mdi-arrow-up</v-icon>
                  {{ percentualReceitasMes }}%
                </v-chip>
                vs. mês anterior
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="resumo-card despesas-card" elevation="3">
            <v-card-title class="white--text">
              <v-icon large left color="white">mdi-cash-minus</v-icon>
              Despesas do Mês
            </v-card-title>
            <v-card-text class="text-center">
              <div class="text-h4 mt-2">
                {{ formatCurrency(totalDespesasMes) }}
              </div>
              <div class="text-subtitle-1 mt-2">
                <v-chip small color="red" text-color="white" class="mr-1">
                  <v-icon small left>mdi-arrow-up</v-icon>
                  {{ percentualDespesasMes }}%
                </v-chip>
                vs. mês anterior
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="resumo-card saldo-card" elevation="3">
            <v-card-title class="white--text">
              <v-icon large left color="white">mdi-scale-balance</v-icon>
              Saldo do Mês
            </v-card-title>
            <v-card-text class="text-center">
              <div class="text-h4 mt-2" :class="saldoClass">
                {{ formatCurrency(saldoMes) }}
              </div>
              <div class="text-subtitle-1 mt-2">
                <v-chip
                  small
                  :color="saldoMes >= 0 ? 'green' : 'red'"
                  text-color="white"
                  class="mr-1"
                >
                  <v-icon small left>{{
                    saldoMes >= 0 ? "mdi-arrow-up" : "mdi-arrow-down"
                  }}</v-icon>
                  {{ Math.abs(percentualSaldoMes) }}%
                </v-chip>
                vs. mês anterior
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Taxa de Ocupação e Indicadores -->
      <v-row class="mt-5">
        <v-col cols="12" md="6">
          <v-card elevation="3">
            <v-card-title>
              <v-icon left>mdi-home-city</v-icon>
              Taxa de Ocupação
            </v-card-title>
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-2">
                <div>Ocupação Atual</div>
                <div class="text-h6">{{ taxaOcupacao }}%</div>
              </div>
              <v-progress-linear
                :value="taxaOcupacao"
                height="20"
                color="primary"
                rounded
              >
                <template v-slot:default="{ value }">
                  <strong>{{ Math.ceil(value) }}%</strong>
                </template>
              </v-progress-linear>

              <v-divider class="my-4"></v-divider>

              <div class="d-flex flex-wrap">
                <div
                  v-for="(flat, index) in flatsStatus"
                  :key="index"
                  class="ma-2"
                >
                  <v-chip
                    :color="flat.ocupado ? 'red' : 'green'"
                    dark
                    class="px-4 py-2"
                  >
                    <v-icon left>{{
                      flat.ocupado ? "mdi-home-lock" : "mdi-home-outline"
                    }}</v-icon>
                    {{ flat.nome }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card elevation="3">
            <v-card-title>
              <v-icon left>mdi-chart-line</v-icon>
              Indicadores de Desempenho
            </v-card-title>
            <v-card-text>
              <v-list dense>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon color="green">mdi-currency-usd</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title
                      >Receita Média por Flat</v-list-item-title
                    >
                    <v-list-item-subtitle>{{
                      formatCurrency(receitaMediaPorFlat)
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-icon>
                    <v-icon color="red">mdi-currency-usd-off</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title
                      >Despesa Média por Flat</v-list-item-title
                    >
                    <v-list-item-subtitle>{{
                      formatCurrency(despesaMediaPorFlat)
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-icon>
                    <v-icon color="blue">mdi-calendar-check</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title
                      >Dias Médios de Ocupação</v-list-item-title
                    >
                    <v-list-item-subtitle
                      >{{ diasMediosOcupacao }} dias/mês</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-icon>
                    <v-icon color="purple">mdi-cash-multiple</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Margem de Lucro</v-list-item-title>
                    <v-list-item-subtitle
                      >{{ margemLucro }}%</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Gráfico de Evolução e Próximas Reservas -->
      <v-row class="mt-5">
        <v-col cols="12" md="8">
          <v-card elevation="3">
            <v-card-title>
              <v-icon left>mdi-chart-timeline-variant</v-icon>
              Evolução Financeira (Últimos 6 meses)
            </v-card-title>
            <v-card-text>
              <div class="chart-container">
                <canvas ref="evolucaoChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card elevation="3">
            <v-card-title>
              <v-icon left>mdi-calendar-clock</v-icon>
              Próximas Reservas
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list dense>
                <v-list-item
                  v-for="(reserva, index) in proximasReservas"
                  :key="index"
                >
                  <v-list-item-avatar>
                    <v-avatar color="primary" size="36">
                      <span class="white--text">{{
                        reserva.hospede.charAt(0)
                      }}</span>
                    </v-avatar>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ reserva.hospede }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ reserva.flat }} •
                      {{ formatDate(reserva.dataInicio) }} até
                      {{ formatDate(reserva.dataFim) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-chip
                      small
                      :color="getStatusColor(reserva.status)"
                      text-color="white"
                    >
                      {{ reserva.status }}
                    </v-chip>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="verTodasReservas">
                Ver todas
                <v-icon right>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Alertas e Notificações -->
      <v-row class="mt-5">
        <v-col cols="12">
          <v-card elevation="3">
            <v-card-title>
              <v-icon left>mdi-bell-ring</v-icon>
              Alertas e Notificações
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item v-for="(alerta, index) in alertas" :key="index">
                  <v-list-item-avatar>
                    <v-avatar :color="getAlertaColor(alerta.tipo)" size="36">
                      <v-icon dark>{{ getAlertaIcon(alerta.tipo) }}</v-icon>
                    </v-avatar>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ alerta.titulo }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      alerta.descricao
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon>
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import Chart from "chart.js/auto";
import axios from "axios";

export default {
  data() {
    return {
      loading: false,
      evolucaoChart: null,
      flats: [],
      receitas: [],
      despesas: [],
      flatsStatus: [
        { id: 1, nome: "Flat 101", ocupado: true },
        { id: 2, nome: "Flat 202", ocupado: false },
        { id: 3, nome: "Flat 303", ocupado: true },
        { id: 4, nome: "Flat 404", ocupado: false },
        { id: 5, nome: "Flat 505", ocupado: false },
      ],
      proximasReservas: [
        {
          hospede: "João Silva",
          flat: "Flat 101",
          dataInicio: "2025-04-01",
          dataFim: "2025-04-10",
          status: "Confirmada",
        },
        {
          hospede: "Maria Oliveira",
          flat: "Flat 202",
          dataInicio: "2025-04-05",
          dataFim: "2025-04-15",
          status: "Pendente",
        },
        {
          hospede: "Carlos Santos",
          flat: "Flat 303",
          dataInicio: "2025-04-12",
          dataFim: "2025-04-20",
          status: "Confirmada",
        },
        {
          hospede: "Ana Pereira",
          flat: "Flat 404",
          dataInicio: "2025-04-18",
          dataFim: "2025-04-25",
          status: "Paga",
        },
      ],
      alertas: [
        {
          tipo: "pagamento",
          titulo: "Pagamento pendente",
          descricao: "Flat 202 - Vencimento em 3 dias",
        },
        {
          tipo: "manutencao",
          titulo: "Manutenção programada",
          descricao: "Flat 303 - Ar-condicionado em 15/04/2025",
        },
        {
          tipo: "checkout",
          titulo: "Check-out hoje",
          descricao: "Flat 101 - João Silva às 12:00",
        },
        {
          tipo: "checkin",
          titulo: "Check-in amanhã",
          descricao: "Flat 505 - Pedro Alves às 14:00",
        },
      ],
      totalReceitasMes: 4800,
      totalDespesasMes: 1850,
      percentualReceitasMes: 12,
      percentualDespesasMes: 5,
      taxaOcupacao: 60,
      diasMediosOcupacao: 22,
      receitaMediaPorFlat: 1600,
      despesaMediaPorFlat: 620,
      margemLucro: 61,
    };
  },
  computed: {
    ...mapState(["isDarkMode"]),
    saldoMes() {
      return this.totalReceitasMes - this.totalDespesasMes;
    },
    saldoClass() {
      return this.saldoMes >= 0 ? "green--text" : "red--text";
    },
    percentualSaldoMes() {
      return this.percentualReceitasMes - this.percentualDespesasMes;
    },
  },
  methods: {
    ...mapActions(["fetchFlats"]),
    formatDate(date) {
      if (!date) return "";

      try {
        // Se a data já estiver no formato brasileiro, retorne como está
        if (typeof date === "string" && date.includes("/")) {
          return date;
        }

        // Se a data estiver no formato ISO
        if (typeof date === "string" && date.includes("-")) {
          // Extrair componentes da data
          const [year, month, day] = date.split("-");
          // Horário meio-dia para evitar problemas de fuso horário
          const dateObj = new Date(year, month - 1, parseInt(day), 12, 0, 0);
          return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
        }

        // Para objetos Date
        const dateObj = new Date(date);
        dateObj.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de fuso horário
        return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
      } catch (error) {
        console.error("Erro ao formatar data:", error);
        return "";
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },
    getStatusColor(status) {
      const colors = {
        Confirmada: "blue",
        Pendente: "orange",
        Paga: "green",
        Cancelada: "red",
      };
      return colors[status] || "grey";
    },
    getAlertaColor(tipo) {
      const colors = {
        pagamento: "amber darken-2",
        manutencao: "blue",
        checkout: "green",
        checkin: "purple",
      };
      return colors[tipo] || "grey";
    },
    getAlertaIcon(tipo) {
      const icons = {
        pagamento: "mdi-cash-clock",
        manutencao: "mdi-tools",
        checkout: "mdi-exit-to-app",
        checkin: "mdi-login",
      };
      return icons[tipo] || "mdi-bell";
    },
    verTodasReservas() {
      // Navegar para a página de reservas
      this.$router.push("/reservas");
    },
    async carregarDados() {
      this.loading = true;
      try {
        // Carregar flats do banco
        await axios
          .get("http://localhost:8080/api/flats/listar", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          })
          .then((response) => {
            this.flats = response.data;
          })
          .catch((error) => {
            console.error("Erro ao buscar flats:", error);
            // Usar dados mock em caso de erro
            this.flats = [
              { id: 1, nome: "Flat 101" },
              { id: 2, nome: "Flat 202" },
              { id: 3, nome: "Flat 303" },
              { id: 4, nome: "Flat 404" },
              { id: 5, nome: "Flat 505" },
            ];
          });

        // Após carregar os dados, criar os gráficos
        this.$nextTick(() => {
          this.criarGraficoEvolucao();
        });
      } finally {
        this.loading = false;
      }
    },
    criarGraficoEvolucao() {
      // Destruir gráfico existente se houver
      if (this.evolucaoChart) {
        this.evolucaoChart.destroy();
      }

      // Dados para os últimos 6 meses
      const meses = [];
      const dadosReceitas = [];
      const dadosDespesas = [];
      const dadosSaldo = [];

      // Gerar dados para os últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const data = subMonths(new Date(), i);
        meses.push(format(data, "MMM/yyyy", { locale: ptBR }));

        // Valores simulados
        const receita = 3000 + Math.floor(Math.random() * 2000);
        const despesa = 1000 + Math.floor(Math.random() * 1000);
        dadosReceitas.push(receita);
        dadosDespesas.push(despesa);
        dadosSaldo.push(receita - despesa);
      }

      // Criar gráfico
      const ctx = this.$refs.evolucaoChart.getContext("2d");
      this.evolucaoChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: meses,
          datasets: [
            {
              label: "Receitas",
              data: dadosReceitas,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              tension: 0.1,
            },
            {
              label: "Despesas",
              data: dadosDespesas,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 2,
              tension: 0.1,
            },
            {
              label: "Saldo",
              data: dadosSaldo,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 2,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: (value) => this.formatCurrency(value),
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  return `${context.dataset.label}: ${this.formatCurrency(value)}`;
                },
              },
            },
          },
        },
      });
    },
  },
  created() {
    this.carregarDados();
  },
  beforeDestroy() {
    // Destruir gráficos ao sair da página
    if (this.evolucaoChart) {
      this.evolucaoChart.destroy();
    }
  },
};
</script>

<style scoped>
.resumo-card {
  border-radius: 8px;
  transition: transform 0.3s;
}
.resumo-card:hover {
  transform: translateY(-5px);
}
.receitas-card {
  background: linear-gradient(45deg, #2e7d32, #4caf50);
}
.despesas-card {
  background: linear-gradient(45deg, #c62828, #f44336);
}
.saldo-card {
  background: linear-gradient(45deg, #1565c0, #2196f3);
}
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
