<!-- eslint-disable vue/valid-v-slot -->

<template>
  <v-container>
    <div class="mt-5">
      <v-row align="center">
        <v-col cols="12">
          <v-btn
            class="action-button mb-5"
            color="primary"
            @click="openNewDespesa"
            rounded
            elevation="2"
          >
            Nova Despesa
          </v-btn>
        </v-col>
      </v-row>

      <!-- Filtros -->
      <v-row>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Pesquisar despesas"
            single-line
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
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
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dataInicio"
              @input="menuDataInicio = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="2">
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
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dataFim"
              @input="menuDataFim = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="flatFilter"
            :items="flats"
            item-text="nome"
            item-value="id"
            label="Filtrar por Flat"
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="categoriaFilter"
            :items="categorias"
            label="Filtrar por Categoria"
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn
            color="primary"
            @click="limparFiltros"
            rounded
            elevation="2"
            class="limpar-filtros-btn"
          >
            <v-icon left>mdi-filter-remove</v-icon>
            Limpar Filtros
          </v-btn>
        </v-col>
      </v-row>

      <!-- Tabela de Despesas -->
      <v-data-table
        :headers="headers"
        :items="filteredDespesas"
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
            class="categoria-chip"
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
                @click="editarDespesa(item)"
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
            <span>Editar Despesa</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="delete-icon mx-1"
                icon
                v-bind="attrs"
                v-on="on"
                @click="confirmarExcluirDespesa(item)"
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
            <span>Excluir Despesa</span>
          </v-tooltip>
        </template>
      </v-data-table>

      <!-- Modal de Nova Despesa -->
      <v-dialog v-model="despesaDialog" max-width="600px">
        <v-card>
          <v-card-title class="text-h5">
            <div class="flex-grow-1">
              {{ editMode ? "Editar Despesa" : "Nova Despesa" }}
            </div>
            <v-btn icon @click="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="despesa.descricao"
                :rules="descricaoRules"
                label="Descrição"
                required
              ></v-text-field>

              <v-select
                v-model="despesa.flatId"
                :items="flats"
                item-text="nome"
                item-value="id"
                label="Flat"
                :rules="flatRules"
                required
              ></v-select>

              <v-select
                v-model="despesa.categoria"
                :items="categorias"
                label="Categoria"
                :rules="categoriaRules"
                required
              ></v-select>

              <v-text-field
                v-model="despesa.valor"
                :rules="valorRules"
                label="Valor"
                required
              ></v-text-field>

              <v-menu
                v-model="menuDataDespesa"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="despesa.data"
                    :value="formatDate(despesa.data)"
                    label="Data"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="despesa.data"
                  @input="menuDataDespesa = false"
                ></v-date-picker>
              </v-menu>

              <v-textarea
                v-model="despesa.observacoes"
                label="Observações"
                rows="3"
                auto-grow
              ></v-textarea>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="salvarDespesa">
              {{ editMode ? "Salvar" : "Adicionar" }}
            </v-btn>
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
      despesas: [],
      flats: [],
      categorias: [
        "Manutenção",
        "Limpeza",
        "Condomínio",
        "IPTU",
        "Água",
        "Energia",
        "Internet",
        "Mobília",
        "Reforma",
        "Outros",
      ],
      categoriaCores: {
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
      loading: false,
      dataInicio: "",
      dataFim: "",
      menuDataInicio: false,
      menuDataFim: false,
      flatFilter: null,
      categoriaFilter: null,
      despesaDialog: false,
      editMode: false,
      valid: false,
      menuDataDespesa: false,
      despesa: this.getDefaultDespesa(),
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
    filteredDespesas() {
      return this.despesas.filter((despesa) => {
        const matchesSearch = despesa.descricao
          .toLowerCase()
          .includes(this.search.toLowerCase());
        const matchesFlat = this.flatFilter
          ? despesa.flatId === this.flatFilter
          : true;
        const matchesCategoria = this.categoriaFilter
          ? despesa.categoria === this.categoriaFilter
          : true;
        const matchesDateRange =
          (!this.dataInicio ||
            new Date(despesa.data) >= new Date(this.dataInicio)) &&
          (!this.dataFim || new Date(despesa.data) <= new Date(this.dataFim));
        return (
          matchesSearch && matchesFlat && matchesCategoria && matchesDateRange
        );
      });
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
    getDefaultDespesa() {
      return {
        descricao: "",
        flatId: null,
        categoria: "",
        valor: "",
        data: new Date().toISOString().substr(0, 10),
        observacoes: "",
      };
    },
    openNewDespesa() {
      this.editMode = false;
      this.despesa = this.getDefaultDespesa();
      this.despesaDialog = true;
    },
    editarDespesa(despesa) {
      this.editMode = true;
      const despesaCopy = { ...despesa };

      // Garantir que a data esteja no formato ISO para o datepicker
      if (despesaCopy.data && despesaCopy.data.includes("/")) {
        const [day, month, year] = despesaCopy.data.split("/");
        despesaCopy.data = `${year}-${month}-${day}`;
      }

      this.despesa = despesaCopy;
      this.despesaDialog = true;
    },
    confirmarExcluirDespesa(despesa) {
      Swal.fire({
        title: "Tem certeza?",
        text: "Você não poderá reverter isso!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, excluir!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.excluirDespesa(despesa);
        }
      });
    },
    excluirDespesa(despesa) {
      // Mock para simulação
      this.despesas = this.despesas.filter((d) => d.id !== despesa.id);
      Swal.fire("Excluído!", "A despesa foi excluída.", "success");

      // Implementação real:
      /*
      axios.delete(`/api/despesas/${despesa.id}`)
        .then(() => {
          this.fetchDespesas();
          Swal.fire("Excluído!", "A despesa foi excluída.", "success");
        })
        .catch(error => {
          console.error("Erro ao excluir despesa:", error);
          Swal.fire("Erro!", "Não foi possível excluir a despesa.", "error");
        });
      */
    },
    salvarDespesa() {
      if (this.$refs.form.validate()) {
        const isNew = !this.despesa.id;

        // Mock para simulação
        if (isNew) {
          this.despesa.id =
            Math.max(...this.despesas.map((d) => d.id || 0), 0) + 1;

          // Adicionar o nome do flat para exibição na tabela
          const flat = this.flats.find((f) => f.id === this.despesa.flatId);
          this.despesa.flatNome = flat ? flat.nome : "Flat não encontrado";

          this.despesas.push({ ...this.despesa });
        } else {
          const index = this.despesas.findIndex(
            (d) => d.id === this.despesa.id,
          );
          if (index !== -1) {
            // Atualizar o nome do flat
            const flat = this.flats.find((f) => f.id === this.despesa.flatId);
            this.despesa.flatNome = flat ? flat.nome : "Flat não encontrado";

            this.despesas.splice(index, 1, { ...this.despesa });
          }
        }

        this.despesaDialog = false;
        Swal.fire(
          "Sucesso!",
          isNew
            ? "Despesa criada com sucesso!"
            : "Despesa atualizada com sucesso!",
          "success",
        );

        // Implementação real:
        /*
        const request = isNew
          ? axios.post("/api/despesas", this.despesa)
          : axios.put(`/api/despesas/${this.despesa.id}`, this.despesa);

        request
          .then(() => {
            this.fetchDespesas();
            this.despesaDialog = false;
            Swal.fire("Sucesso!", isNew ? "Despesa criada com sucesso!" : "Despesa atualizada com sucesso!", "success");
          })
          .catch(error => {
            console.error("Erro ao salvar despesa:", error);
            Swal.fire("Erro!", "Não foi possível salvar a despesa.", "error");
          });
        */
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
      this.despesaDialog = false;
      this.$refs.form.resetValidation();
      this.despesa = this.getDefaultDespesa();
    },
    getCategoriaColor(categoria) {
      return this.categoriaCores[categoria] || "grey";
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
            ];
          });

        // Carregar despesas (mock por enquanto)
        this.despesas = [
          {
            id: 1,
            descricao: "Manutenção do ar-condicionado",
            flatId: 1,
            flatNome: "Flat 101",
            categoria: "Manutenção",
            valor: 350,
            data: "2025-03-05",
            observacoes: "Troca de filtro e limpeza geral",
          },
          {
            id: 2,
            descricao: "Conta de energia",
            flatId: 2,
            flatNome: "Flat 202",
            categoria: "Energia",
            valor: 180,
            data: "2025-03-10",
            observacoes: "",
          },
          {
            id: 3,
            descricao: "Limpeza pós-hospedagem",
            flatId: 1,
            flatNome: "Flat 101",
            categoria: "Limpeza",
            valor: 120,
            data: "2025-03-15",
            observacoes: "Limpeza completa após check-out",
          },
        ];
      } finally {
        this.loading = false;
      }
    },
  },
  created() {
    this.carregarDados();
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
