<!-- eslint-disable -->

<template>
  <v-container class="container-color">
    <div class="mt-5">
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
      <v-row>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="search"
            :append-icon="null"
            label="Pesquisar receitas"
            single-line
            hide-details
          >
            <template v-slot:append>
              <span v-html="octicons.search.toSVG({ class: 'octicon' })"></span>
            </template>
          </v-text-field>
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
        <v-col cols="12" md="auto" class="d-flex align-center justify-end mb-2">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
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
      return this.receitas.filter((receita) => {
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
        return (
          matchesSearch && matchesFlat && matchesCategoria && matchesDateRange
        );
      });
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
        showCancelButton: true,
        confirmButtonColor: "#primary",
        cancelButtonColor: "#secondary",
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          this.excluirReceita(receita);
        }
      });
    },
    excluirReceita(receita) {
      // Mock para simulação
      this.receitas = this.receitas.filter((r) => r.id !== receita.id);
      Swal.fire({
        title: "Excluído!",
        text: "A receita foi excluída com sucesso.",
        icon: "success",
        showConfirmButton: false,
        timer: 1200,
      });

      // Implementação real:
      /*
      axios.delete(`/api/receitas/${receita.id}`)
        .then(() => {
          this.fetchReceitas();
          Swal.fire("Excluído!", "A receita foi excluída.", "success");
        })
        .catch(error => {
          console.error("Erro ao excluir receita:", error);
          Swal.fire("Erro!", "Não foi possível excluir a receita.", "error");
        });
      */
    },
    salvarReceita() {
      if (this.$refs.form.validate()) {
        const isNew = !this.receita.id;

        // Associar o nome do flat à receita
        const flatSelecionado = this.flats.find(
          (flat) => flat.id === this.receita.flatId,
        );
        if (flatSelecionado) {
          this.receita.flatNome = flatSelecionado.nome;
        }

        // Mock para simulação
        if (isNew) {
          this.receita.id = Math.max(...this.receitas.map((r) => r.id), 0) + 1;
          this.receitas.push({ ...this.receita });
        } else {
          const index = this.receitas.findIndex(
            (r) => r.id === this.receita.id,
          );
          if (index !== -1) {
            this.receitas.splice(index, 1, { ...this.receita });
          }
        }

        this.receitaDialog = false;
        Swal.fire(
          "Sucesso!",
          isNew
            ? "Receita criada com sucesso!"
            : "Receita atualizada com sucesso!",
          "success",
        );

        // Implementação real:
        /*
        const request = isNew
          ? axios.post("/api/receitas", this.receita)
          : axios.put(`/api/receitas/${this.receita.id}`, this.receita);

        request
          .then(() => {
            this.fetchReceitas();
            this.receitaDialog = false;
            Swal.fire("Sucesso!", isNew ? "Receita criada com sucesso!" : "Receita atualizada com sucesso!", "success");
          })
          .catch(error => {
            console.error("Erro ao salvar receita:", error);
            Swal.fire("Erro!", "Não foi possível salvar a receita.", "error");
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
      this.receitaDialog = false;
      this.$refs.form.resetValidation();
      this.receita = this.getDefaultReceita();
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

        // Carregar hóspedes do banco
        await axios
          .get("http://localhost:8080/api/hospedes/listar", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          })
          .then((response) => {
            this.hospedes = response.data;
          })
          .catch((error) => {
            console.error("Erro ao buscar hóspedes:", error);
            // Usar dados mock em caso de erro
            this.hospedes = [
              { id: 1, nome: "João Silva" },
              { id: 2, nome: "Maria Oliveira" },
              { id: 3, nome: "Carlos Santos" },
            ];
          });

        // Carregar receitas (mock por enquanto)
        this.receitas = [
          {
            id: 1,
            descricao: "Receita de aluguel",
            flatId: 1,
            flatNome: "Flat 101",
            hospedeId: 1,
            categoria: "Aluguel",
            valor: 1500,
            data: "2025-03-01",
          },
          {
            id: 2,
            descricao: "Taxa de limpeza",
            flatId: 2,
            flatNome: "Flat 202",
            hospedeId: 2,
            categoria: "Taxa de Limpeza",
            valor: 500,
            data: "2025-03-02",
          },
          {
            id: 3,
            descricao: "Caução devolvido",
            flatId: 1,
            flatNome: "Flat 101",
            hospedeId: 3,
            categoria: "Caução",
            valor: 1000,
            data: "2025-03-05",
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
.github-chip {
  background-color: var(--github-chip-background-color);
  color: var(--github-chip-text-color);
}
</style>
