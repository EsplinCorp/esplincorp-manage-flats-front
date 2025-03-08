<template>
  <v-container>
    <div class="mt-5"></div>
    <!-- Title row -->
    <v-row>
      <v-col cols="12" class="d-flex align-items-center">
        <h2 class="ml-2 mt-3 font-weight-normal">Lembretes</h2>
      </v-col>
    </v-row>

    <!-- Button row -->
    <v-row>
      <v-col cols="12">
        <v-btn
          class="action-button mb-5"
          color="primary"
          @click="openNewLembreteDialog"
          rounded
          elevation="2"
        >
          <span v-html="octicons.plus.toSVG({ class: 'octicon mr-2' })"></span>
          Novo Lembrete
        </v-btn>
      </v-col>
    </v-row>
    <!-- Filtros -->
    <v-row class="mb-7">
      <v-col cols="12" md="3" class="py-0">
        <v-text-field
          v-model="search"
          :append-icon="null"
          label="Pesquisar lembretes"
          single-line
          hide-details
          dense
        >
          <template v-slot:append>
            <span v-html="octicons.search.toSVG({ class: 'octicon' })"></span>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" md="3" class="py-0">
        <v-select
          v-model="priorityFilter"
          :items="priorityOptions"
          label="Prioridade"
          multiple
          chips
          small-chips
          deletable-chips
          dense
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" md="3" class="py-0">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Filtrar por Status"
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

    <!-- Lista de lembretes -->
    <v-data-table
      :headers="headers"
      :items="filteredLembretes"
      :loading="loading"
      class="elevation-1 small-text"
      sort-by="titulo"
      :items-per-page="10"
      :footer-props="{
        'items-per-page-options': [5, 10, 15, 20],
      }"
    >
      <!-- Status chip -->
      <template #[`item.status`]="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          dark
          small
          class="small-chip github-chip"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <!-- Prioridade chip -->
      <template #[`item.prioridade`]="{ item }">
        <v-chip
          :color="getPriorityColor(item.prioridade)"
          dark
          small
          class="small-chip github-chip"
        >
          {{ item.prioridade }}
        </v-chip>
      </template>

      <!-- Ações -->
      <template #[`item.actions`]="{ item }">
        <v-tooltip :key="item.id + '-' + item.status" bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              class="mr-2"
              icon
              small
              v-bind="attrs"
              v-on="on"
              @click="marcarConcluido(item)"
              :disabled="item.status === 'Concluído'"
            >
              <span
                v-html="
                  octicons['check-circle'].toSVG({
                    class: 'octicon',
                    style: `fill: ${
                      item.status === 'Concluído'
                        ? 'green'
                        : 'var(--primary-color)'
                    };`,
                  })
                "
              ></span>
            </v-btn>
          </template>
          <span>Marcar como concluído</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              class="mr-2"
              icon
              small
              v-bind="attrs"
              v-on="on"
              @click="editarLembrete(item)"
            >
              <span
                v-html="
                  octicons.pencil.toSVG({
                    class: 'octicon',
                    style: 'fill: var(--primary-color);',
                  })
                "
              ></span>
            </v-btn>
          </template>
          <span>Editar lembrete</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              icon
              small
              v-bind="attrs"
              v-on="on"
              @click="confirmDeleteLembrete(item)"
            >
              <span
                v-html="
                  octicons.trash.toSVG({
                    class: 'octicon',
                    style: 'fill: var(--primary-color);',
                  })
                "
              ></span>
            </v-btn>
          </template>
          <span>Excluir lembrete</span>
        </v-tooltip>
      </template>

      <!-- Sem dados -->
      <template #no-data>
        <v-alert type="info" text class="mt-3">
          Nenhum lembrete encontrado
        </v-alert>
      </template>
    </v-data-table>

    <!-- Diálogo para adicionar/editar lembretes -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          <div class="flex-grow-1">
            {{ isEditing ? "Editar Lembrete" : "Novo Lembrete" }}
          </div>
          <v-btn icon @click="closeDialog">
            <span v-html="octicons.x.toSVG({ class: 'octicon' })"></span>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="lembrete.titulo"
              :rules="[(v) => !!v || 'Título é obrigatório']"
              label="Título"
              required
            ></v-text-field>

            <v-textarea
              v-model="lembrete.descricao"
              label="Descrição"
              rows="3"
            ></v-textarea>

            <v-select
              v-model="lembrete.prioridade"
              :items="['Baixa', 'Média', 'Alta', 'Urgente']"
              label="Prioridade"
              required
              :rules="[(v) => !!v || 'Prioridade é obrigatória']"
            ></v-select>

            <v-select
              v-model="lembrete.categoria"
              :items="[
                'Manutenção',
                'Check-in/Check-out',
                'Pagamento',
                'Limpeza',
                'Outro',
              ]"
              label="Categoria"
              required
              :rules="[(v) => !!v || 'Categoria é obrigatória']"
            ></v-select>

            <v-select
              v-model="lembrete.flatId"
              :items="flats"
              item-text="nome"
              item-value="id"
              label="Relacionado ao flat (opcional)"
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="salvarLembrete" class="edit-button" :disabled="!valid">
            {{ isEditing ? "Atualizar" : "Salvar" }}
          </v-btn>
          <v-btn @click="closeDialog" class="delete-button" text
            >Cancelar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import * as octicons from "@primer/octicons";
import axios from "axios";
import Swal from "sweetalert2";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default {
  data() {
    return {
      isDesktop: window.innerWidth > 600,
      octicons,
      search: "",
      loading: false,
      lembretes: [],
      flats: [],
      dialog: false,
      isEditing: false,
      valid: false,
      lembrete: this.getDefaultLembrete(),
      headers: [
        { text: "Prioridade", value: "prioridade" },
        { text: "Categoria", value: "categoria" },
        { text: "Título", value: "titulo", sortable: true },
        { text: "Flat", value: "flatNome" },
        { text: "Status", value: "status" },
        { text: "Ações", value: "actions", sortable: false, align: "center" },
      ],
      statusFilter: null,
      priorityFilter: [],
      dateFilter: "",
      statusOptions: ["Pendente", "Em andamento", "Concluído", "Atrasado"],
      priorityOptions: ["Baixa", "Média", "Alta", "Urgente"],
    };
  },
  computed: {
    ...mapState({
      isDarkMode: (state) => state.isDarkMode,
    }),

    filteredLembretes() {
      return this.lembretes.filter((lembrete) => {
        // Filtro de pesquisa
        const matchesSearch = lembrete.titulo
          .toLowerCase()
          .includes(this.search.toLowerCase());

        // Filtro de prioridade
        const matchesPriority =
          this.priorityFilter.length === 0 ||
          this.priorityFilter.includes(lembrete.prioridade);

        // Filtro de status
        const matchesStatus = this.statusFilter
          ? lembrete.status === this.statusFilter
          : true;

        return matchesSearch && matchesPriority && matchesStatus;
      });
    },
  },
  filters: {
    formatDate(dateString) {
      if (!dateString) return "";

      try {
        if (typeof dateString === "string") {
          // Se for uma string ISO
          if (dateString.includes("T")) {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
          }
          // Se for uma string de data simples (YYYY-MM-DD)
          else if (dateString.includes("-")) {
            return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
          }
        }

        // Se for um objeto Date
        if (dateString instanceof Date) {
          return format(dateString, "dd/MM/yyyy", { locale: ptBR });
        }

        return dateString;
      } catch (error) {
        console.error("Erro ao formatar data:", error);
        return dateString;
      }
    },
  },
  created() {
    window.addEventListener("resize", this.checkWidth);
    this.verificarAutenticacao();
    this.setupAxiosInterceptors();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkWidth);
  },
  methods: {
    ...mapActions(["logoutUser"]),

    verificarAutenticacao() {
      console.log("=== VERIFICAÇÃO DE AUTENTICAÇÃO ===");

      const token = localStorage.getItem("userToken");

      // Verificar se o token existe
      if (!token) {
        console.error("Token não encontrado no localStorage");
        this.redirecionarParaLogin();
        return false;
      }

      // Verificar se o token está no formato correto
      if (
        !token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
      ) {
        console.error("Token em formato inválido");
        this.redirecionarParaLogin();
        return false;
      }

      // Testar o token com uma requisição simples antes de carregar os dados
      return this.validarToken()
        .then(() => {
          console.log("Token válido, iniciando carregamento de dados");
          this.carregarDados();
          return true;
        })
        .catch(() => {
          console.error("Token inválido ou expirado");
          this.redirecionarParaLogin();
          return false;
        });
    },

    // Novo método para testar o token
    validarToken() {
      const token = localStorage.getItem("userToken");
      if (!token) {
        return Promise.reject(new Error("Token não encontrado"));
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      return axios.get("https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/auth/validar", { 
        headers,
        withCredentials: false 
      });
    },

    carregarDados() {
      this.loading = true;

      // Carregar flats primeiro
      this.fetchFlats()
        .then(() => {
          return this.fetchLembretes();
        })
        .catch((error) => {
          console.error("Erro ao carregar dados:", error);
          if (error.response?.status === 401) {
            this.redirecionarParaLogin();
          } else {
            Swal.fire({
              title: "Erro",
              text: "Não foi possível carregar os dados. Tente novamente mais tarde.",
              icon: "error",
            });
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },

    fetchFlats() {
      console.log("=== INÍCIO DO CARREGAMENTO DE FLATS ===");

      const token = localStorage.getItem("userToken");
      if (!token) {
        return Promise.reject(new Error("Token não encontrado"));
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      return axios
        .get("https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/flats/listar", { headers })
        .then((response) => {
          this.flats = response.data;
          console.log("Flats carregados com sucesso:", this.flats.length);
          return this.flats;
        })
        .catch((error) => {
          console.error("Erro ao buscar flats:", error);
          if (error.response?.status === 401) {
            this.redirecionarParaLogin();
          }
          return Promise.reject(error);
        });
    },

    fetchLembretes() {
      console.log("=== INÍCIO DO CARREGAMENTO DE LEMBRETES ===");

      const token = localStorage.getItem("userToken");
      if (!token) {
        return Promise.reject(new Error("Token não encontrado"));
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      return axios
        .get("https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/lembretes/listar", { 
          headers,
          withCredentials: false
        })
        .then((response) => {
          console.log("Lembretes recebidos da API:", response.data);

          // Verificar se a resposta é um array
          if (!Array.isArray(response.data)) {
            console.warn("Resposta da API não é um array:", response.data);
            this.lembretes = [];
            return [];
          }

          this.lembretes = response.data.map((lembrete) => {
            // Processar cada lembrete para garantir formato correto
            const flatEncontrado = this.flats.find(
              (f) => f.id === lembrete.flatId,
            );

            return {
              id: lembrete.id,
              titulo: lembrete.titulo || "",
              descricao: lembrete.descricao || "",
              prioridade: lembrete.prioridade || "Média",
              categoria: lembrete.categoria || "Outro",
              status: lembrete.status || "Pendente",
              flatId: lembrete.flatId,
              flatNome: flatEncontrado
                ? flatEncontrado.nome
                : "Flat não encontrado",
            };
          });

          console.log("Total de lembretes processados:", this.lembretes.length);
          return this.lembretes;
        })
        .catch((error) => {
          console.error("Erro ao buscar lembretes:", error);
          if (error.response?.status === 401) {
            this.redirecionarParaLogin();
          }
          return Promise.reject(error);
        });
    },

    openNewLembreteDialog() {
      this.isEditing = false;
      this.lembrete = this.getDefaultLembrete();
      this.dialog = true;
    },

    editarLembrete(lembrete) {
      this.isEditing = true;
      // Criar uma cópia do lembrete para edição
      this.lembrete = { ...lembrete };
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    getDefaultLembrete() {
      return {
        titulo: "",
        descricao: "",
        prioridade: "Média",
        categoria: "Outro",
        status: "Pendente",
        flatId: null,
        flatNome: "",
      };
    },

    salvarLembrete() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        const isNew = !this.lembrete.id;

        // Preparar o objeto para envio
        const lembreteDto = {
          id: this.lembrete.id,
          titulo: this.lembrete.titulo.trim(),
          descricao: this.lembrete.descricao?.trim() || "",
          prioridade: this.lembrete.prioridade,
          categoria: this.lembrete.categoria,
          status: this.lembrete.status || "Pendente",
          flatId: this.lembrete.flatId,
        };

        console.log("Enviando lembrete para API:", lembreteDto);

        const token = localStorage.getItem("userToken");
        if (!token) {
          this.loading = false;
          this.$router.push("/login");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Verificar endpoints corretos
        const url = isNew
          ? "https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/lembretes/registrar"
          : `https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/lembretes/atualizar/${this.lembrete.id}`;

        const method = isNew ? "post" : "put";

        axios[method](url, lembreteDto, { 
          headers,
          withCredentials: false
        })
          .then((response) => {
            console.log(
              `Lembrete ${isNew ? "criado" : "atualizado"} com sucesso:`,
              response.data,
            );
            this.fetchLembretes();
            this.closeDialog();
            Swal.fire({
              title: "Sucesso",
              text: isNew
                ? "Lembrete criado com sucesso!"
                : "Lembrete atualizado com sucesso!",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
          })
          .catch((error) => {
            console.error("Erro ao salvar lembrete:", error);

            if (error.response?.status === 401) {
              this.handleSessionExpired();
            } else {
              Swal.fire({
                title: "Erro",
                text: "Não foi possível salvar o lembrete",
                icon: "error",
              });
            }
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },

    marcarConcluido(lembrete) {
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

      const statusDto = { status: "Concluído" };

      axios
        .put(
          `https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/lembretes/${lembrete.id}/status`,
          statusDto,
          { 
            headers,
            withCredentials: false
          },
        )
        .then((response) => {
          console.log("Lembrete marcado como concluído:", response.data);
          this.fetchLembretes();
          Swal.fire({
            title: "Concluído!",
            text: "Lembrete marcado como concluído",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        })
        .catch((error) => {
          console.error("Erro ao atualizar status:", error);

          if (error.response?.status === 401) {
            console.error("Sessão expirada - redirecionando para login");
            localStorage.removeItem("userToken");
            this.$router.push("/login");
            return;
          }

          Swal.fire({
            title: "Erro",
            text: "Não foi possível atualizar o status do lembrete",
            icon: "error",
          });
        });
    },

    confirmDeleteLembrete(lembrete) {
      Swal.fire({
        title: "Tem certeza?",
        text: `Deseja excluir o lembrete "${lembrete.titulo}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "var(--primary-color)",
        cancelButtonColor: "var(--secondary-color)",
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          this.deletarLembrete(lembrete);
        }
      });
    },

    deletarLembrete(lembrete) {
      const token = localStorage.getItem("userToken");
      if (!token) {
        console.error("Token não encontrado");
        this.$router.push("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      axios
        .delete(`https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/lembretes/excluir/${lembrete.id}`, {
          headers,
          withCredentials: false
        })
        .then(() => {
          console.log("Lembrete excluído com sucesso");
          this.fetchLembretes();
          Swal.fire({
            title: "Excluído!",
            text: "Lembrete excluído com sucesso",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        })
        .catch((error) => {
          console.error("Erro ao excluir lembrete:", error);

          if (error.response?.status === 401) {
            console.error("Sessão expirada - redirecionando para login");
            localStorage.removeItem("userToken");
            this.$router.push("/login");
            return;
          }

          Swal.fire({
            title: "Erro",
            text: "Não foi possível excluir o lembrete",
            icon: "error",
          });
        });
    },

    getStatusColor(status) {
      const colors = {
        Pendente: "orange",
        "Em andamento": "blue",
        Concluído: "green",
        Atrasado: "red",
        Cancelado: "grey",
      };
      return colors[status] || "primary";
    },

    getPriorityColor(priority) {
      const colors = {
        Baixa: "teal",
        Média: "blue",
        Alta: "deep-orange",
        Urgente: "red",
      };
      return colors[priority] || "primary";
    },

    limparFiltros() {
      this.search = "";
      this.priorityFilter = [];
      this.statusFilter = null;
      this.dateFilter = null;
    },

    checkWidth() {
      this.isDesktop = window.innerWidth > 600;
    },

    // Método para lidar com sessão expirada
    handleSessionExpired() {
      console.error("Sessão expirada - redirecionando para login");
      this.redirecionarParaLogin();
    },

    // Novo método para configurar interceptores do Axios
    setupAxiosInterceptors() {
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            console.error("Erro de autenticação detectado pelo interceptor");
            this.redirecionarParaLogin();
          }
          return Promise.reject(error);
        },
      );
    },

    redirecionarParaLogin() {
      console.log("Redirecionando para login e limpando dados de autenticação");

      // Limpar dados locais
      this.lembretes = [];
      this.flats = [];

      // Limpar token e redirecionar
      localStorage.removeItem("userToken");

      // Usar o Vuex para fazer logout
      this.logoutUser().then(() => {
        this.$router.push("/login").catch((err) => {
          if (err.name !== "NavigationDuplicated") {
            throw err;
          }
        });
      });
    },
  },
};
</script>

<style scoped>
.font-weight-normal {
  font-weight: normal;
}

.small-chip {
  font-size: 0.8rem;
  height: auto;
  padding: 0.25rem;
  border-radius: 7px;
}

.small-text .v-data-table-header th,
.small-text .v-data-table__wrapper td {
  font-size: 0.875rem;
  padding: 5px 5px;
}

.v-data-table ::v-deep .v-data-footer {
  font-size: 0.875rem;
}

.octicon {
  width: 16px;
  height: 16px;
}

.text-left {
  text-align: left;
}

/* Add background color styling */
.container-color {
  background-color: var(--v-background-base, #f5f7fa);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
