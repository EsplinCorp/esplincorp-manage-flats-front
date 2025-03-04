<!-- eslint-disable -->

<template>
  <v-container class="container-color">
    <div class="mt-4">
      <v-row align="center">
        <v-col cols="12">
          <v-btn
            class="action-button"
            color="primary"
            @click="openNewReceita"
            rounded
            elevation="2"
          >
            <span
              v-html="octicons.plus.toSVG({ class: 'octicon mr-2' })"
            ></span>
            Nova Receita
          </v-btn>
        </v-col>
      </v-row>

      <!-- Filtros -->
      <v-row class="mb-7 mt-7">
        <v-col cols="12" md="3" class="py-0">
          <v-text-field
            v-model="search"
            :append-icon="null"
            label="Pesquisar receitas"
            single-line
            hide-details
            dense
          >
            <template v-slot:append>
              <span v-html="octicons.search.toSVG({ class: 'octicon' })"></span>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="2" class="py-0">
          <v-menu
            v-model="menuDataInicio"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
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
        <v-col cols="12" md="2" class="py-0">
          <v-menu
            v-model="menuDataFim"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
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
          ></v-select>
        </v-col>
        <v-col cols="12" md="2" class="py-0">
          <v-select
            v-model="categoriaFilter"
            :items="categorias"
            label="Filtrar por Categoria"
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

      <!-- Tabela de Receitas -->
      <v-data-table
        :headers="headers"
        :items="filteredReceitas"
        :loading="loading"
        class="elevation-1 small-text"
        mobile-breakpoint="500"
        dense
        :items-per-page="10"
        :footer-props="{
          'items-per-page-options': [10, 20, 50, -1],
          'items-per-page-text': 'Itens por página',
        }"
      >
        <template v-slot:item.data="{ item }">
          {{ formatDate(item.data) }}
        </template>
        <template v-slot:item.valor="{ item }">
          {{ formatCurrency(item.valor) }}
        </template>
        <template v-slot:item.categoria="{ item }">
          <v-chip
            :color="getCategoriaColor(item.categoria)"
            dark
            small
            class="categoria-chip github-chip"
          >
            {{ item.categoria }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="edit-icon mx-1"
                icon
                v-bind="attrs"
                v-on="on"
                @click="editarReceita(item)"
              >
                <span
                  v-html="
                    octicons['pencil'].toSVG({
                      style: 'fill: var(--primary-color);',
                    })
                  "
                ></span>
              </v-btn>
            </template>
            <span>Editar Receita</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="delete-icon mx-1"
                icon
                v-bind="attrs"
                v-on="on"
                @click="confirmarExcluirReceita(item)"
              >
                <span
                  v-html="
                    octicons['trash'].toSVG({
                      style: 'fill: var(--primary-color);',
                    })
                  "
                ></span>
              </v-btn>
            </template>
            <span>Excluir Receita</span>
          </v-tooltip>
        </template>

        <!-- Sem dados -->
        <template #no-data>
          <v-alert type="info" text class="mt-3">
            Nenhuma receita encontrada
          </v-alert>
        </template>
      </v-data-table>

      <!-- Modal de Nova Receita -->
      <v-dialog v-model="receitaDialog" max-width="600px">
        <v-card>
          <v-card-title class="text-h5">
            <div class="flex-grow-1">
              {{ editMode ? "Editar Receita" : "Nova Receita" }}
            </div>
            <v-btn icon @click="closeDialog">
              <span v-html="octicons.x.toSVG({ class: 'octicon' })"></span>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="receita.descricao"
                :rules="descricaoRules"
                label="Descrição"
                required
              ></v-text-field>

              <v-select
                v-model="receita.flatId"
                :items="flats"
                item-text="nome"
                item-value="id"
                label="Flat"
                :rules="flatRules"
                required
              ></v-select>

              <v-select
                v-model="receita.hospedeId"
                :items="hospedes"
                item-text="nome"
                item-value="id"
                label="Hóspede (Opcional)"
                clearable
              ></v-select>

              <v-select
                v-model="receita.categoria"
                :items="categorias"
                label="Categoria"
                :rules="categoriaRules"
                required
              ></v-select>

              <v-text-field
                v-model="receita.valor"
                :rules="valorRules"
                label="Valor"
                required
              ></v-text-field>

              <v-menu
                v-model="menuDataReceita"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    :value="formatDate(receita.data)"
                    label="Data"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="receita.data"
                  @input="menuDataReceita = false"
                ></v-date-picker>
              </v-menu>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="action-button" color="primary" @click="salvarReceita">
              {{ editMode ? "Atualizar" : "Gravar" }}
            </v-btn>
            <v-btn class="delete-button" text @click="closeDialog"
              >Cancelar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as octicons from "@primer/octicons";
import axios from "axios";

export default {
  data() {
    return {
      octicons,
      search: "",
      receitas: [],
      flats: [],
      hospedes: [],
      categorias: [
        "Aluguel",
        "Taxa de Limpeza",
        "Taxa de Serviço",
        "Caução",
        "Manutenção",
        "Outros",
      ],
      categoriaCores: {
        Aluguel: "teal",
        "Taxa de Limpeza": "indigo",
        "Taxa de Serviço": "purple",
        Caução: "blue",
        Manutenção: "orange",
        Outros: "grey darken-1",
      },
      loading: false,
      dataInicio: "",
      dataFim: "",
      menuDataInicio: false,
      menuDataFim: false,
      flatFilter: null,
      categoriaFilter: null,
      receitaDialog: false,
      editMode: false,
      valid: false,
      menuDataReceita: false,
      receita: this.getDefaultReceita(),
      headers: [
        { text: "Data", value: "data" },
        { text: "Descrição", value: "descricao" },
        { text: "Flat", value: "flatNome" },
        { text: "Categoria", value: "categoria" },
        { text: "Valor", value: "valor" },
        { text: "Ações", value: "actions", sortable: false },
      ],

      // Regras de validação
      descricaoRules: [
        (v) => !!v || "Descrição é obrigatória",
        (v) =>
          (v && v.length <= 100) ||
          "Descrição deve ter no máximo 100 caracteres",
      ],
      flatRules: [(v) => !!v || "Flat é obrigatório"],
      categoriaRules: [(v) => !!v || "Categoria é obrigatória"],
      valorRules: [
        (v) => !!v || "Valor é obrigatório",
        (v) => !isNaN(parseFloat(v)) || "Valor deve ser um número",
      ],
    };
  },
  computed: {
    ...mapState(["isDarkMode"]),
    filteredReceitas() {
      console.log("=== INÍCIO DO FILTRO DE RECEITAS ===");
      console.log("Total de receitas antes do filtro:", this.receitas.length);
      console.log("Estado dos filtros:", {
        busca: this.search,
        flat: this.flatFilter,
        categoria: this.categoriaFilter,
        dataInicio: this.dataInicio,
        dataFim: this.dataFim,
      });

      const filtered = this.receitas.filter((receita) => {
        console.log(`\nAnalisando receita:`, {
          id: receita.id,
          descricao: receita.descricao,
          flat: receita.flatNome,
          categoria: receita.categoria,
        });

        const matchesSearch = receita.descricao
          .toLowerCase()
          .includes(this.search.toLowerCase());
        const matchesFlat = this.flatFilter
          ? receita.flatId === this.flatFilter
          : true;
        const matchesCategoria = this.categoriaFilter
          ? receita.categoria === this.categoriaFilter
          : true;
        const matchesDateRange =
          (!this.dataInicio ||
            new Date(receita.data) >= new Date(this.dataInicio)) &&
          (!this.dataFim || new Date(receita.data) <= new Date(this.dataFim));

        console.log("Resultados do filtro:", {
          matchesSearch,
          matchesFlat,
          matchesCategoria,
          matchesDateRange,
        });

        return (
          matchesSearch && matchesFlat && matchesCategoria && matchesDateRange
        );
      });

      console.log(`\n=== RESULTADO DO FILTRO ===`);
      console.log("Total de receitas após filtro:", filtered.length);
      return filtered;
    },
  },
  methods: {
    ...mapActions(["fetchFlats", "fetchHospedes"]),
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
    getDefaultReceita() {
      return {
        descricao: "",
        flatId: null,
        hospedeId: null,
        categoria: "",
        valor: "",
        data: new Date().toISOString().substr(0, 10),
      };
    },
    openNewReceita() {
      this.editMode = false;
      this.receita = this.getDefaultReceita();
      this.receitaDialog = true;
    },
    editarReceita(receita) {
      this.editMode = true;
      const receitaCopy = { ...receita };

      // Garantir que a data esteja no formato ISO para o datepicker
      if (receitaCopy.data && receitaCopy.data.includes("/")) {
        const [day, month, year] = receitaCopy.data.split("/");
        receitaCopy.data = `${year}-${month}-${day}`;
      }

      this.receita = receitaCopy;
      this.receitaDialog = true;
    },
    confirmarExcluirReceita(receita) {
      Swal.fire({
        title: "Tem certeza?",
        html: `Deseja excluir a receita <b>${receita.descricao}</b>?`,
        icon: "warning",
        showConfirmButton: true,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Sim, excluir",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          this.excluirReceita(receita);
        }
      });
    },
    excluirReceita(receita) {
      axios
        .delete(`http://localhost:8080/api/transacoes/excluir/${receita.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        })
        .then(() => {
          this.carregarDados();
          Swal.fire({
            title: "Excluído!",
            text: "A receita foi excluída com sucesso.",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        })
        .catch((error) => {
          console.error("Erro ao excluir receita:", error);
          Swal.fire({
            title: "Erro!",
            text: "Não foi possível excluir a receita.",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
        });
    },
    async salvarReceita() {
      if (this.$refs.form.validate()) {
        const isNew = !this.receita.id;

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

          // Preparar dados da transação
          const transacao = {
            id: this.receita.id, // Incluir ID se for uma edição
            descricao: this.receita.descricao,
            flatId: this.receita.flatId,
            data: this.receita.data,
            tipo: "RECEITA",
            valor: parseFloat(this.receita.valor),
            categoria: this.receita.categoria,
          };

          console.log("Enviando dados da transação:", transacao);

          // Usar endpoint correto baseado se é uma nova receita ou edição
          const url = isNew
            ? "http://localhost:8080/api/transacoes/registrar"
            : `http://localhost:8080/api/transacoes/atualizar/${this.receita.id}`;

          const method = isNew ? "post" : "put";

          const response = await axios[method](url, transacao, { headers });

          console.log(
            `Receita ${isNew ? "criada" : "atualizada"} com sucesso:`,
            response.data,
          );

          // Recarregar dados para atualizar a tabela
          await this.carregarDados();

          this.receitaDialog = false;
          Swal.fire({
            title: "Sucesso!",
            text: isNew
              ? "Receita criada com sucesso!"
              : "Receita atualizada com sucesso!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          if (error.response?.status === 401) {
            console.error("Sessão expirada");
            localStorage.removeItem("userToken");
            this.$router.push("/login");
            return;
          }
          console.error("Erro ao salvar receita:", error);
          Swal.fire({
            title: "Erro!",
            text: "Não foi possível salvar a receita.",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    },
    limparFiltros() {
      this.search = "";
      this.dataInicio = "";
      this.dataFim = "";
      this.flatFilter = null;
      this.categoriaFilter = null;
    },
    closeDialog() {
      this.receitaDialog = false;
      this.$refs.form.resetValidation();
      this.receita = this.getDefaultReceita();
    },
    getCategoriaColor(categoria) {
      return this.categoriaCores[categoria] || "grey";
    },
    async carregarDados() {
      console.log("=== INÍCIO DO CARREGAMENTO DE DADOS ===");
      this.loading = true;
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          console.error("Token não encontrado");
          this.$router.push("/login");
          return;
        }

        console.log("Token encontrado, iniciando requisições...");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Carregar flats do banco
        try {
          console.log("Buscando flats...");
          const responseFlats = await axios.get(
            "http://localhost:8080/api/flats/listar",
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

        // Carregar hóspedes do banco
        try {
          const responseHospedes = await axios.get(
            "http://localhost:8080/api/hospedes/listar",
            { headers },
          );
          this.hospedes = responseHospedes.data;
        } catch (error) {
          if (error.response?.status === 401) {
            throw error; // Será tratado no catch principal
          }
          console.error("Erro ao buscar hóspedes:", error);
        }

        // Carregar transações do tipo RECEITA
        try {
          console.log("=== INÍCIO DA BUSCA DE TRANSAÇÕES ===");
          const responseTransacoes = await axios.get(
            "http://localhost:8080/api/transacoes/flat/all",
            { headers },
          );

          console.log("RESPOSTA DA API:", responseTransacoes.data);

          // Filtrar apenas as transações do tipo RECEITA
          const receitasFiltradas = responseTransacoes.data.filter(
            (transacao) => transacao.tipo === "RECEITA",
          );

          console.log("RECEITAS FILTRADAS:", receitasFiltradas);

          // Mapear as receitas para o formato da tabela
          this.receitas = receitasFiltradas.map((transacao) => {
            const flatEncontrado = this.flats.find(
              (f) => f.id === transacao.flatId,
            );

            // Garantir que valores sejam do tipo correto
            return {
              id: transacao.id,
              descricao: transacao.descricao || "",
              flatId: transacao.flatId,
              flatNome: flatEncontrado
                ? flatEncontrado.nome
                : "Flat não encontrado",
              categoria: transacao.categoria || "Outros", // Valor padrão caso esteja ausente
              valor: parseFloat(transacao.valor || 0),
              data: transacao.data,
            };
          });

          console.log("=== LISTA FINAL DE RECEITAS ===", this.receitas);
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
  },
  created() {
    this.carregarDados();
  },
  watch: {
    drawer() {
      this.profileMenu = false; // Fecha o menu quando o drawer muda
    },
    darkTheme(newVal) {
      this.$vuetify.theme.dark = newVal;
      localStorage.setItem("darkTheme", JSON.stringify(newVal));
      this.updateCssVariables();
    },
    receitas: {
      handler(newVal) {
        console.log("Receitas atualizadas:", newVal);
        this.$nextTick(() => {
          console.log("Forçando atualização da tabela");
          this.$forceUpdate();
        });
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.action-button {
  background-color: var(--primary-color);
  color: white;
}
.edit-icon {
  color: var(--primary-color);
}
.delete-icon {
  color: var(--primary-color);
}
.custom-card {
  background-color: var(--card-background-color);
}
.limpar-filtros-btn {
  width: 100%;
  margin-top: 3px;
}
.categoria-chip {
  font-size: 0.8rem;
  height: auto;
  padding: 0.25rem;
  border-radius: 7px;
}
</style>
