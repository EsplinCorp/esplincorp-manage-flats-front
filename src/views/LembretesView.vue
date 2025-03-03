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
    <v-row>
      <v-col cols="12" md="3" class="mb-4">
        <v-text-field
          v-model="search"
          :append-icon="null"
          label="Pesquisar lembretes"
          single-line
          hide-details
        >
          <template v-slot:append>
            <span v-html="octicons.search.toSVG({ class: 'octicon' })"></span>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" md="3" class="mb-4">
        <v-select
          v-model="priorityFilter"
          :items="priorityOptions"
          label="Prioridade"
          multiple
          chips
          small-chips
          deletable-chips
        ></v-select>
      </v-col>
      <v-col cols="12" md="3" class="mb-4">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Filtrar por Status"
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" md="auto" class="d-flex align-center justify-end mb-4">
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
      <v-col cols="12" md="2" class="mb-4">
        <v-menu
          v-model="dateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
        </v-menu>
      </v-col>
    </v-row>

    <!-- Lista de lembretes -->
    <v-data-table
      :headers="headers"
      :items="filteredLembretes"
      :loading="loading"
      class="elevation-1 small-text"
      sort-by="dataVencimento"
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
          class="small-chip"
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
          class="small-chip"
        >
          {{ item.prioridade }}
        </v-chip>
      </template>

      <!-- Ações -->
      <template #[`item.actions`]="{ item }">
        <v-tooltip bottom>
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
                    style: `fill: ${item.status === 'Concluído' ? 'green' : 'var(--primary-color)'};`,
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

            <v-menu
              v-model="menuData"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="lembrete.dataVencimento"
                  label="Data de vencimento"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :rules="[(v) => !!v || 'Data é obrigatória']"
                  required
                  :value="formatDate(lembrete.dataVencimento)"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="lembrete.dataVencimento"
                @input="menuData = false"
              ></v-date-picker>
            </v-menu>

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
import { format } from "date-fns";
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
      menuData: false,
      dateMenu: false,
      lembrete: this.getDefaultLembrete(),
      headers: [
        { text: "Prioridade", value: "prioridade" },
        { text: "Categoria", value: "categoria" },
        { text: "Título", value: "titulo", sortable: true },
        { text: "Flat", value: "flatNome" },
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
    formatDate(value) {
      if (!value) return "";

      try {
        // Se a data já estiver no formato brasileiro, retorne como está
        if (typeof value === "string" && value.includes("/")) {
          return value;
        }

        // Se a data estiver no formato ISO
        if (typeof value === "string" && value.includes("-")) {
          // Extrair componentes da data
          const [year, month, day] = value.split("-");
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
  },
  created() {
    window.addEventListener("resize", this.checkWidth);
    this.fetchLembretes();
    this.fetchFlats();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkWidth);
  },
  methods: {
    ...mapActions(["logoutUser"]),

    performLogout() {
      this.logoutUser()
        .then(() => {
          this.$router.push("/login");
        })
        .catch((error) => {
          console.error("Erro no logout:", error);
        });
    },

    checkWidth() {
      this.isDesktop = window.innerWidth > 600;
    },

    fetchLembretes() {
      this.loading = true;

      // Mock data para exemplo - em um cenário real, isso seria uma chamada API
      setTimeout(() => {
        this.lembretes = [
          {
            id: 1,
            titulo: "Manutenção ar-condicionado",
            descricao: "Agendar manutenção preventiva para o ar-condicionado",
            prioridade: "Média",
            categoria: "Manutenção",
            status: "Pendente",
            dataVencimento: "2024-05-15",
            flatId: 1,
            flatNome: "Flat Ipanema 201",
          },
          {
            id: 2,
            titulo: "Check-out hóspede Andrea",
            descricao: "Preparar documentação para check-out",
            prioridade: "Alta",
            categoria: "Check-in/Check-out",
            status: "Em andamento",
            dataVencimento: "2024-05-10",
            flatId: 2,
            flatNome: "Flat Copacabana 305",
          },
          {
            id: 3,
            titulo: "Pagamento de contas",
            descricao: "Efetuar pagamento das contas de energia",
            prioridade: "Urgente",
            categoria: "Pagamento",
            status: "Pendente",
            dataVencimento: "2024-05-08",
            flatId: null,
            flatNome: "Todos os flats",
          },
        ];
        this.loading = false;
      });

      // Implementação real:
      /*
      axios.get("http://localhost:8080/api/lembretes/listar", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })
      .then(response => {
        this.lembretes = response.data;
        this.loading = false;
      })
      .catch(error => {
        console.error("Erro ao buscar lembretes:", error);
        this.loading = false;
        Swal.fire({
          title: "Erro",
          text: "Não foi possível carregar os lembretes",
          icon: "error"
        });
      });
      */
    },

    fetchFlats() {
      axios
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
        });
    },

    openNewLembreteDialog() {
      this.isEditing = false;
      this.lembrete = this.getDefaultLembrete();
      this.dialog = true;
    },

    editarLembrete(lembrete) {
      this.isEditing = true;
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
        dataVencimento: new Date().toISOString().substr(0, 10),
        flatId: null,
        flatNome: "",
      };
    },

    salvarLembrete() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        const isNew = !this.lembrete.id;

        // Atualizar o flatNome com base no flatId selecionado
        const flatSelecionado = this.flats.find(
          (flat) => flat.id === this.lembrete.flatId,
        );
        this.lembrete.flatNome = flatSelecionado ? flatSelecionado.nome : "";

        // Mock para simulação - em um sistema real, isso seria uma chamada API
        setTimeout(() => {
          if (isNew) {
            this.lembrete.id =
              Math.max(...this.lembretes.map((l) => l.id), 0) + 1;
            this.lembretes.push({ ...this.lembrete });
          } else {
            const index = this.lembretes.findIndex(
              (l) => l.id === this.lembrete.id,
            );
            if (index !== -1) {
              this.lembretes.splice(index, 1, { ...this.lembrete });
            }
          }

          this.loading = false;
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
        }, 1000);

        // Implementação real:
        /*
        const url = isNew 
          ? "http://localhost:8080/api/lembretes/registrar"
          : `http://localhost:8080/api/lembretes/${this.lembrete.id}/atualizar`;
          
        const method = isNew ? "post" : "put";
        
        axios[method](url, this.lembrete, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        })
        .then(() => {
          this.fetchLembretes();
          this.closeDialog();
          Swal.fire({
            title: "Sucesso",
            text: isNew ? "Lembrete criado com sucesso!" : "Lembrete atualizado com sucesso!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500
          });
        })
        .catch(error => {
          console.error("Erro ao salvar lembrete:", error);
          Swal.fire({
            title: "Erro",
            text: "Não foi possível salvar o lembrete",
            icon: "error"
          });
        })
        .finally(() => {
          this.loading = false;
        });
        */
      }
    },

    marcarConcluido(lembrete) {
      const lembreteAtualizado = { ...lembrete, status: "Concluído" };

      // Mock para simulação
      const index = this.lembretes.findIndex((l) => l.id === lembrete.id);
      if (index !== -1) {
        this.lembretes.splice(index, 1, lembreteAtualizado);

        Swal.fire({
          title: "Concluído!",
          text: "Lembrete marcado como concluído",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      // Implementação real:
      /*
      axios.put(`http://localhost:8080/api/lembretes/${lembrete.id}/status`, { status: "Concluído" }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })
      .then(() => {
        this.fetchLembretes();
        Swal.fire({
          title: "Concluído!",
          text: "Lembrete marcado como concluído",
          icon: "success",
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch(error => {
        console.error("Erro ao atualizar status:", error);
        Swal.fire({
          title: "Erro",
          text: "Não foi possível atualizar o status do lembrete",
          icon: "error"
        });
      });
      */
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
      // Mock para simulação
      this.lembretes = this.lembretes.filter((l) => l.id !== lembrete.id);
      Swal.fire({
        title: "Excluído!",
        text: "Lembrete excluído com sucesso",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });

      // Implementação real:
      /*
      axios.delete(`http://localhost:8080/api/lembretes/${lembrete.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })
      .then(() => {
        this.fetchLembretes();
        Swal.fire({
          title: "Excluído!",
          text: "Lembrete excluído com sucesso",
          icon: "success",
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch(error => {
        console.error("Erro ao excluir lembrete:", error);
        Swal.fire({
          title: "Erro",
          text: "Não foi possível excluir o lembrete",
          icon: "error"
        });
      });
      */
    },

    getStatusColor(status) {
      const colors = {
        Pendente: "orange",
        "Em andamento": "blue",
        Concluído: "green",
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
