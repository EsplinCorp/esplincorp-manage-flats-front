<!-- eslint-disable -->

<template>
  <v-container class="container-color">
    <div class="mt-5 mb-3 mt-9">
      <!-- Filtros -->
      <v-row>
        <v-col cols="12" md="3" class="py-0">
          <v-menu
            v-model="menuDataInicio"
            :close-on-content-click="false"
            x
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                :value="formatDate(dataInicio)"
                label="Data Inicial"
                readonly
                v-bind="attrs"
                v-on="on"
                dense
                hide-details
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dataInicio"
              @input="menuDataInicio = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="3" class="py-0">
          <v-menu
            v-model="menuDataFim"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                :value="formatDate(dataFim)"
                label="Data Final"
                readonly
                v-bind="attrs"
                v-on="on"
                dense
                hide-details
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dataFim"
              @input="menuDataFim = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="3" class="py-0">
          <v-select
            v-model="flatFilter"
            :items="flats"
            item-text="nome"
            item-value="id"
            label="Filtrar por Flat"
            clearable
            dense
            hide-details
          ></v-select>
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
                  v-html="octicons['filter-remove'].toSVG({ class: 'octicon' })"
                ></span>
              </v-btn>
            </template>
            <span>Limpar Filtro</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <!-- Cards de Resumo -->
      <v-row class="mt-7">
        <v-col cols="12" md="4">
          <v-card class="resumo-card receitas-card" elevation="3">
            <v-card-title class="white--text"> Receitas </v-card-title>
            <v-card-text class="text-center">
              <div class="text-h4 mt-2">
                {{ formatCurrency(totalReceitas) }}
              </div>
              <div class="text-subtitle-1 mt-2">
                {{ receitasCount }} transações
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="resumo-card despesas-card" elevation="3">
            <v-card-title class="white--text"> Despesas </v-card-title>
            <v-card-text class="text-center">
              <div class="text-h4 mt-2">
                {{ formatCurrency(totalDespesas) }}
              </div>
              <div class="text-subtitle-1 mt-2">
                {{ despesasCount }} transações
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="resumo-card saldo-card" elevation="3">
            <v-card-title class="white--text"> Saldo </v-card-title>
            <v-card-text class="text-center">
              <div class="text-h4 mt-2" :class="saldoClass">
                {{ formatCurrency(saldo) }}
              </div>
              <div class="text-subtitle-1 mt-2">Resultado do período</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Gráficos -->
      <v-row class="mt-5">
        <v-col cols="12" md="6">
          <v-card elevation="3">
            <v-card-title> Receitas por Categoria </v-card-title>
            <v-card-text>
              <div class="chart-container">
                <canvas ref="receitasChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card elevation="3">
            <v-card-title> Despesas por Categoria </v-card-title>
            <v-card-text>
              <div class="chart-container">
                <canvas ref="despesasChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-5">
        <v-col cols="12">
          <v-card elevation="3">
            <v-card-title> Evolução Financeira </v-card-title>
            <v-card-text>
              <div class="chart-container">
                <canvas ref="evolucaoChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Tabela de Transações -->
      <v-row class="mt-5">
        <v-col cols="12">
          <v-card elevation="3">
            <v-card-title>
              Últimas Transações
              <v-spacer></v-spacer>
              <v-text-field
                v-model="searchTransacao"
                append-icon="mdi-magnify"
                label="Pesquisar"
                single-line
                hide-details
                class="ml-2"
                style="max-width: 300px"
              ></v-text-field>
            </v-card-title>
            <v-data-table
              :headers="transacoesHeaders"
              :items="transacoesFiltradas"
              :loading="loading"
              class="elevation-0"
              mobile-breakpoint="500"
              dense
              :items-per-page="5"
            >
              <template #item.data="{ item }">
                {{ formatDate(item.data) }}
              </template>
              <template #item.valor="{ item }">
                <span
                  :class="item.tipo === 'receita' ? 'green--text' : 'red--text'"
                >
                  {{ formatCurrency(item.valor) }}
                </span>
              </template>
              <template #item.tipo="{ item }">
                <v-chip
                  :color="item.tipo === 'receita' ? 'green' : 'red'"
                  dark
                  small
                  class="tipo-chip"
                >
                  {{ item.tipo === "receita" ? "Receita" : "Despesa" }}
                </v-chip>
              </template>
              <template #item.categoria="{ item }">
                <v-chip
                  :color="getCategoriaColor(item.categoria, item.tipo)"
                  dark
                  small
                  class="categoria-chip"
                >
                  {{ item.categoria }}
                </v-chip>
              </template>

              <!-- Sem dados -->
              <template #no-data>
                <v-alert type="info" text class="mt-3">
                  Nenhum balanço encontrado
                </v-alert>
              </template>
            </v-data-table>
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
import axios from "axios";
import Chart from "chart.js/auto";
import * as octicons from "@primer/octicons";

export default {
  data() {
    return {
      octicons,
      loading: false,
      dataInicio: subMonths(new Date(), 3).toISOString().substr(0, 10), // 3 meses atrás
      dataFim: new Date().toISOString().substr(0, 10), // hoje
      menuDataInicio: false,
      menuDataFim: false,
      flatFilter: null,
      flats: [],
      receitas: [],
      despesas: [],
      searchTransacao: "",
      receitasChart: null,
      despesasChart: null,
      evolucaoChart: null,
      transacoesHeaders: [
        { text: "Data", value: "data" },
        { text: "Descrição", value: "descricao" },
        { text: "Flat", value: "flatNome" },
        { text: "Tipo", value: "tipo" },
        { text: "Categoria", value: "categoria" },
        { text: "Valor", value: "valor" },
      ],
      categoriaCoresReceitas: {
        Aluguel: "teal",
        "Taxa de Limpeza": "indigo",
        "Taxa de Serviço": "purple",
        Caução: "blue",
        Manutenção: "orange",
        Outros: "grey darken-1",
      },
      categoriaCoresDespesas: {
        Manutenção: "orange",
        Limpeza: "indigo",
        Condomínio: "purple",
        IPTU: "red",
        Água: "blue",
        Energia: "amber darken-2",
        Internet: "cyan",
        Mobília: "brown",
        Reforma: "deep-orange",
        Outros: "grey darken-1",
      },
    };
  },
  computed: {
    ...mapState(["isDarkMode"]),
    totalReceitas() {
      return this.receitas.reduce(
        (total, receita) => total + parseFloat(receita.valor),
        0,
      );
    },
    totalDespesas() {
      return this.despesas.reduce(
        (total, despesa) => total + parseFloat(despesa.valor),
        0,
      );
    },
    saldo() {
      return this.totalReceitas - this.totalDespesas;
    },
    saldoClass() {
      return this.saldo >= 0 ? "green--text" : "red--text";
    },
    receitasCount() {
      return this.receitas.length;
    },
    despesasCount() {
      return this.despesas.length;
    },
    transacoes() {
      // Combinar receitas e despesas em uma única lista
      const receitasFormatadas = this.receitas.map((r) => ({
        ...r,
        tipo: "receita",
      }));

      const despesasFormatadas = this.despesas.map((d) => ({
        ...d,
        tipo: "despesa",
      }));

      // Combinar e ordenar por data (mais recente primeiro)
      return [...receitasFormatadas, ...despesasFormatadas].sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
      });
    },
    transacoesFiltradas() {
      if (!this.searchTransacao) {
        return this.transacoes;
      }

      const searchTerm = this.searchTransacao.toLowerCase();
      return this.transacoes.filter(
        (t) =>
          t.descricao.toLowerCase().includes(searchTerm) ||
          t.categoria.toLowerCase().includes(searchTerm) ||
          t.flatNome.toLowerCase().includes(searchTerm),
      );
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
    getCategoriaColor(categoria, tipo) {
      if (tipo === "receita") {
        return this.categoriaCoresReceitas[categoria] || "green";
      } else {
        return this.categoriaCoresDespesas[categoria] || "red";
      }
    },
    async carregarDados() {
      this.loading = true;
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          console.error("Token não encontrado");
          this.$router.push("/login");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Carregar flats do banco
        try {
          console.log("Buscando flats...");
          const responseFlats = await axios.get(
            "https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/flats/listar",
            { headers },
          );
          this.flats = responseFlats.data;
          console.log("Flats carregados:", this.flats);
        } catch (error) {
          console.error("ERRO ao buscar flats:", error);
          if (error.response?.status === 401) {
            throw error;
          }
        }

        // Carregar todas as transações
        try {
          console.log("=== INÍCIO DA BUSCA DE TRANSAÇÕES ===");

          // Formatar datas para comparação
          const dataInicio = this.dataInicio ? new Date(this.dataInicio) : null;
          const dataFim = this.dataFim ? new Date(this.dataFim) : null;

          console.log("Filtros aplicados:", {
            dataInicio: this.dataInicio,
            dataFim: this.dataFim,
            flatId: this.flatFilter,
          });

          const responseTransacoes = await axios.get(
            "https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/transacoes/flat/all",
            { headers },
          );

          console.log("RESPOSTA DA API:", responseTransacoes.data);

          // Separar transações em receitas e despesas com filtros
          const todasTransacoes = Array.isArray(responseTransacoes.data)
            ? responseTransacoes.data
            : [];

          // Função auxiliar para verificar se a data está no intervalo
          const estaNoIntervalo = (dataStr) => {
            if (!dataStr) return false;
            const data = new Date(dataStr);
            if (dataInicio && data < dataInicio) return false;
            if (dataFim && data > dataFim) return false;
            return true;
          };

          // Aplicar filtros nas receitas
          this.receitas = todasTransacoes
            .filter((transacao) => {
              // Filtro por tipo
              if (transacao.tipo !== "RECEITA") return false;

              // Filtro por flat
              if (this.flatFilter && transacao.flatId !== this.flatFilter)
                return false;

              // Filtro por data
              if (dataInicio || dataFim) {
                return estaNoIntervalo(transacao.data);
              }

              return true;
            })
            .map((transacao) => {
              const flatEncontrado = this.flats.find(
                (f) => f.id === transacao.flatId,
              );
              return {
                id: transacao.id,
                descricao: transacao.descricao || "",
                flatId: transacao.flatId,
                flatNome: flatEncontrado
                  ? flatEncontrado.nome
                  : "Flat não encontrado",
                categoria: transacao.categoria || "Outros",
                valor: parseFloat(transacao.valor || 0),
                data: transacao.data,
              };
            });

          // Aplicar filtros nas despesas
          this.despesas = todasTransacoes
            .filter((transacao) => {
              // Filtro por tipo
              if (transacao.tipo !== "DESPESA") return false;

              // Filtro por flat
              if (this.flatFilter && transacao.flatId !== this.flatFilter)
                return false;

              // Filtro por data
              if (dataInicio || dataFim) {
                return estaNoIntervalo(transacao.data);
              }

              return true;
            })
            .map((transacao) => {
              const flatEncontrado = this.flats.find(
                (f) => f.id === transacao.flatId,
              );
              return {
                id: transacao.id,
                descricao: transacao.descricao || "",
                flatId: transacao.flatId,
                flatNome: flatEncontrado
                  ? flatEncontrado.nome
                  : "Flat não encontrado",
                categoria: transacao.categoria || "Outros",
                valor: parseFloat(transacao.valor || 0),
                data: transacao.data,
              };
            });

          console.log("=== DADOS CARREGADOS ===");
          console.log("Total de Receitas:", this.receitas.length);
          console.log("Total de Despesas:", this.despesas.length);
          console.log("Receitas filtradas:", this.receitas);
          console.log("Despesas filtradas:", this.despesas);

          // Após carregar os dados, criar os gráficos
          this.$nextTick(() => {
            this.criarGraficos();
          });
        } catch (error) {
          console.error("ERRO CRÍTICO ao buscar transações:", error);
          if (error.response) {
            console.error("Detalhes do erro:", {
              status: error.response.status,
              data: error.response.data,
            });
          }
          if (error.response?.status === 401) {
            throw error;
          }
          this.receitas = [];
          this.despesas = [];
        }
      } catch (error) {
        console.error("ERRO GERAL:", error);
        if (error.response?.status === 401) {
          console.error("Sessão expirada - redirecionando para login");
          localStorage.removeItem("userToken");
          this.$router.push("/login");
          return;
        }
      } finally {
        this.loading = false;
        console.log("=== FIM DO CARREGAMENTO DE DADOS ===");
      }
    },
    criarGraficos() {
      this.criarGraficoReceitas();
      this.criarGraficoDespesas();
      this.criarGraficoEvolucao();
    },
    criarGraficoReceitas() {
      // Destruir gráfico existente se houver
      if (this.receitasChart) {
        this.receitasChart.destroy();
      }

      // Agrupar receitas por categoria
      const categorias = {};
      this.receitas.forEach((receita) => {
        if (!categorias[receita.categoria]) {
          categorias[receita.categoria] = 0;
        }
        categorias[receita.categoria] += parseFloat(receita.valor);
      });

      // Preparar dados para o gráfico
      const labels = Object.keys(categorias);
      const data = Object.values(categorias);
      const backgroundColor = labels.map((label) =>
        this.getChartColor(label, "receita"),
      );

      // Criar gráfico
      const ctx = this.$refs.receitasChart.getContext("2d");
      this.receitasChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: backgroundColor,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  return `${context.label}: ${this.formatCurrency(value)}`;
                },
              },
            },
          },
        },
      });
    },
    criarGraficoDespesas() {
      // Destruir gráfico existente se houver
      if (this.despesasChart) {
        this.despesasChart.destroy();
      }

      // Agrupar despesas por categoria
      const categorias = {};
      this.despesas.forEach((despesa) => {
        if (!categorias[despesa.categoria]) {
          categorias[despesa.categoria] = 0;
        }
        categorias[despesa.categoria] += parseFloat(despesa.valor);
      });

      // Preparar dados para o gráfico
      const labels = Object.keys(categorias);
      const data = Object.values(categorias);
      const backgroundColor = labels.map((label) =>
        this.getChartColor(label, "despesa"),
      );

      // Criar gráfico
      const ctx = this.$refs.despesasChart.getContext("2d");
      this.despesasChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: backgroundColor,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  return `${context.label}: ${this.formatCurrency(value)}`;
                },
              },
            },
          },
        },
      });
    },
    criarGraficoEvolucao() {
      // Destruir gráfico existente se houver
      if (this.evolucaoChart) {
        this.evolucaoChart.destroy();
      }

      // Agrupar transações por mês
      const meses = {};

      // Processar receitas
      this.receitas.forEach((receita) => {
        const data = new Date(receita.data);
        const mesAno = format(data, "MM/yyyy");

        if (!meses[mesAno]) {
          meses[mesAno] = { receitas: 0, despesas: 0 };
        }

        meses[mesAno].receitas += parseFloat(receita.valor);
      });

      // Processar despesas
      this.despesas.forEach((despesa) => {
        const data = new Date(despesa.data);
        const mesAno = format(data, "MM/yyyy");

        if (!meses[mesAno]) {
          meses[mesAno] = { receitas: 0, despesas: 0 };
        }

        meses[mesAno].despesas += parseFloat(despesa.valor);
      });

      // Ordenar meses
      const mesesOrdenados = Object.keys(meses).sort((a, b) => {
        const [mesA, anoA] = a.split("/");
        const [mesB, anoB] = b.split("/");
        return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
      });

      // Calcular saldo acumulado
      let saldoAcumulado = 0;
      const dadosSaldo = mesesOrdenados.map((mes) => {
        saldoAcumulado += meses[mes].receitas - meses[mes].despesas;
        return saldoAcumulado;
      });

      // Preparar dados para o gráfico
      const labels = mesesOrdenados.map((mes) => {
        const [m, a] = mes.split("/");
        return format(new Date(a, m - 1, 1), "MMM/yyyy", { locale: ptBR });
      });

      const dadosReceitas = mesesOrdenados.map((mes) => meses[mes].receitas);
      const dadosDespesas = mesesOrdenados.map((mes) => meses[mes].despesas);

      // Criar gráfico
      const ctx = this.$refs.evolucaoChart.getContext("2d");
      this.evolucaoChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
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
              label: "Saldo Acumulado",
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
    getChartColor(categoria, tipo) {
      // Converter cores do Vuetify para cores CSS para o Chart.js
      const corMap = {
        teal: "#009688",
        indigo: "#3f51b5",
        purple: "#9c27b0",
        blue: "#2196f3",
        orange: "#ff9800",
        "amber darken-2": "#ffa000",
        cyan: "#00bcd4",
        brown: "#795548",
        "deep-orange": "#ff5722",
        red: "#f44336",
        "grey darken-1": "#757575",
        green: "#4caf50",
      };

      let cor;
      if (tipo === "receita") {
        cor = this.categoriaCoresReceitas[categoria];
      } else {
        cor = this.categoriaCoresDespesas[categoria];
      }

      // Extrair a cor base (sem o modificador)
      const corBase = cor
        ? cor.split(" ")[0]
        : tipo === "receita"
          ? "green"
          : "red";

      return corMap[cor] || corMap[corBase] || "#757575";
    },
    limparFiltros() {
      this.resetarFiltrosParaPadrao();
      this.carregarDados();
    },
    resetarFiltrosParaPadrao() {
      const hoje = new Date();
      const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDiaDoMes = new Date(
        hoje.getFullYear(),
        hoje.getMonth() + 1,
        0,
      );

      this.dataInicio = primeiroDiaDoMes.toISOString().substr(0, 10);
      this.dataFim = ultimoDiaDoMes.toISOString().substr(0, 10);
      this.flatFilter = null;
    },
    // Método para fazer um refresh completo dos dados
    refreshCompleto() {
      console.log("Realizando refresh completo do balanço");

      // Resetar filtros para o padrão
      this.resetarFiltrosParaPadrao();

      // Limpar dados existentes
      this.receitas = [];
      this.despesas = [];

      // Destruir gráficos existentes para recriá-los
      if (this.receitasChart) {
        this.receitasChart.destroy();
        this.receitasChart = null;
      }
      if (this.despesasChart) {
        this.despesasChart.destroy();
        this.despesasChart = null;
      }
      if (this.evolucaoChart) {
        this.evolucaoChart.destroy();
        this.evolucaoChart = null;
      }

      // Recarregar todos os dados
      this.carregarDados();
    },
  },
  watch: {
    dataInicio(newVal) {
      console.log("Data Início alterada:", newVal);
      this.carregarDados();
    },
    dataFim(newVal) {
      console.log("Data Fim alterada:", newVal);
      this.carregarDados();
    },
    flatFilter(newVal) {
      console.log("Flat selecionado alterado:", newVal);
      this.carregarDados();
    },
  },
  created() {
    console.log("BalancoView criado - inicializando dados");
    this.resetarFiltrosParaPadrao();
    this.carregarDados();
  },
  mounted() {
    console.log("BalancoView montado - verificando dados");
    if (this.receitas.length === 0 && this.despesas.length === 0) {
      this.refreshCompleto();
    }
  },
  activated() {
    console.log("BalancoView ativado - realizando refresh completo");
    this.refreshCompleto();
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      console.log("Navegando para BalancoView - realizando refresh completo");
      vm.refreshCompleto();
    });
  },
  beforeRouteUpdate(to, from, next) {
    console.log("Rota de BalancoView atualizada - realizando refresh completo");
    this.refreshCompleto();
    next();
  },
  beforeDestroy() {
    // Destruir gráficos ao sair da página
    if (this.receitasChart) {
      this.receitasChart.destroy();
    }
    if (this.despesasChart) {
      this.despesasChart.destroy();
    }
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
.gerar-balanco-btn {
  width: 100%;
  margin-top: 3px;
}
.categoria-chip,
.tipo-chip {
  font-size: 0.8rem;
  height: auto;
  padding: 0.25rem;
  border-radius: 7px;
}
</style>
