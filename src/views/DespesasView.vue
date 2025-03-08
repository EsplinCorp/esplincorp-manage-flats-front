<!-- eslint-disable vue/valid-v-slot -->

<template>
  <v-container class="container-color">
    <div class="mt-4">
      <v-row align="center">
        <v-col cols="12">
          <v-btn
            class="action-button mb-5"
            color="primary"
            @click="openNewDespesa"
            rounded
            elevation="2"
            z
          >
            <span
              v-html="octicons.plus.toSVG({ class: 'octicon mr-2' })"
            ></span>
            Nova Despesa
          </v-btn>
        </v-col>
      </v-row>

      <!-- Filtros -->
      <v-row class="mb-7">
        <v-col cols="12" md="3" class="py-0">
          <v-text-field
            v-model="search"
            :append-icon="null"
            label="Pesquisar despesas"
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

        <!-- Sem dados -->
        <template #no-data>
          <v-alert type="info" text class="mt-3">
            Nenhuma despesa encontrada
          </v-alert>
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
              <span v-html="octicons.x.toSVG({ class: 'octicon' })"></span>
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
            <v-btn class="action-button" color="primary" @click="salvarDespesa">
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
        html: `Deseja excluir a despesa <b>${despesa.descricao}</b>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          this.excluirDespesa(despesa);
        }
      });
    },
    excluirDespesa(despesa) {
      const token = localStorage.getItem("userToken");
      if (!token) {
        this.$router.push("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      axios
        .delete(`https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/transacoes/excluir/${despesa.id}`, {
          headers,
        })
        .then(() => {
          this.carregarDados();
          Swal.fire({
            title: "Excluído!",
            text: "A despesa foi excluída com sucesso.",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        })
        .catch((error) => {
          console.error("Erro ao excluir despesa:", error);
          if (error.response?.status === 401) {
            localStorage.removeItem("userToken");
            this.$router.push("/login");
            return;
          }
          Swal.fire({
            title: "Erro!",
            text: "Não foi possível excluir a despesa.",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
        });
    },
    async salvarDespesa() {
      if (this.$refs.form.validate()) {
        const isNew = !this.despesa.id;

        try {
          const token = localStorage.getItem("userToken");
          if (!token) {
            this.$router.push("/login");
            return;
          }

          const headers = {
            Authorization: `Bearer ${token}`,
          };

          const transacao = {
            id: this.despesa.id,
            descricao: this.despesa.descricao.trim(),
            flatId: this.despesa.flatId,
            data: new Date(this.despesa.data).toISOString(),
            tipo: "DESPESA",
            valor: parseFloat(
              this.despesa.valor.toString().replace(/[^\d.-]/g, ""),
            ),
            categoria: this.despesa.categoria || "Outros",
            observacoes: this.despesa.observacoes?.trim() || "",
          };

          const url = isNew
            ? "https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/transacoes/registrar"
            : `https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/transacoes/${this.despesa.id}`;

          const method = isNew ? "post" : "put";
          await axios[method](url, transacao, { headers });
          await this.carregarDados();
          this.despesaDialog = false;

          Swal.fire({
            title: "Sucesso!",
            text: isNew
              ? "Despesa criada com sucesso!"
              : "Despesa atualizada com sucesso!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Erro ao salvar despesa:", error);
          if (error.response?.status === 401) {
            localStorage.removeItem("userToken");
            this.$router.push("/login");
            return;
          }
          Swal.fire({
            title: "Erro!",
            text: "Não foi possível salvar a despesa.",
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
      this.despesaDialog = false;
      this.$refs.form.resetValidation();
      this.despesa = this.getDefaultDespesa();
    },
    getCategoriaColor(categoria) {
      return this.categoriaCores[categoria] || "grey";
    },
    verificarAutenticacao() {
      const token = localStorage.getItem("userToken");
      console.log("=== VERIFICAÇÃO DE AUTENTICAÇÃO ===");

      if (!token) {
        console.error("Token não encontrado no localStorage");
        this.$router.push("/login");
        return false;
      }

      // Verifica se o token está no formato correto (Bearer token)
      if (
        !token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
      ) {
        console.error("Token em formato inválido");
        localStorage.removeItem("userToken");
        this.$router.push("/login");
        return false;
      }

      console.log("Token válido encontrado");
      this.carregarDados();
      return true;
    },
    async carregarDados() {
      console.log("=== INÍCIO DO CARREGAMENTO DE DADOS ===");
      this.loading = true;

      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          console.error("Token não encontrado no localStorage");
          this.$router.push("/login");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        console.log(
          "Iniciando carregamento com token:",
          token.substring(0, 20) + "...",
        );

        // Carregar flats e transações
        const [flatsResponse, transacoesResponse] = await Promise.all([
          axios.get("https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/flats/listar", { headers }),
          axios.get("https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/transacoes/flat/all", {
            headers,
          }),
        ]);

        this.flats = flatsResponse.data;
        console.log("Flats carregados:", this.flats.length);

        // Filtrar e processar despesas
        this.despesas = transacoesResponse.data
          .filter((transacao) => transacao.tipo === "DESPESA")
          .map((transacao) => {
            const flatEncontrado = this.flats.find(
              (f) => f.id === transacao.flatId,
            );
            return {
              id: transacao._id || transacao.id,
              descricao: transacao.descricao,
              flatId: transacao.flatId,
              flatNome: flatEncontrado
                ? flatEncontrado.nome
                : "Flat não encontrado",
              categoria: transacao.categoria || "Outros",
              valor: parseFloat(transacao.valor || 0),
              data: transacao.data,
              observacoes: transacao.observacoes || "",
            };
          });

        console.log("Total de despesas processadas:", this.despesas.length);
      } catch (error) {
        console.error("ERRO GERAL:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("userToken");
          this.$router.push("/login");
          return;
        }
        Swal.fire({
          title: "Erro!",
          text: "Não foi possível carregar os dados. Por favor, tente novamente.",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });
      } finally {
        this.loading = false;
      }
    },
  },
  created() {
    this.verificarAutenticacao();
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
  color: white !important;
}
.github-chip {
  background-color: var(--github-chip-background-color);
}
</style>
