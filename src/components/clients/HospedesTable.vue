<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title class="text-h5">
        <div class="flex-grow-1">
          {{ editMode ? "Editar Hóspede" : "Novo Hóspede" }}
        </div>
        <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="hospede.nome"
            :rules="nameRules"
            label="Nome"
            required
          ></v-text-field>
          <v-text-field
            v-model="hospede.cpf"
            :rules="cpfCnpjRules"
            label="CPF/CNPJ"
            required
          ></v-text-field>
          <v-text-field
            v-model="hospede.email"
            :rules="emailRules"
            label="Email"
            required
          ></v-text-field>
          <v-text-field
            v-model="hospede.telefone"
            :rules="telefoneRules"
            label="Telefone"
            required
          ></v-text-field>
          <v-select
            v-model="hospede.flatId"
            :items="flats"
            item-value="id"
            item-text="nome"
            :rules="flatIdRules"
            label="Local de Hospedagem"
            required
          ></v-select>
          <v-text-field
            v-model="hospede.dataEntrada"
            label="Data de Check-in"
            type="date"
            required
          ></v-text-field>
          <v-text-field
            v-model="hospede.dataSaida"
            label="Data de Check-out"
            type="date"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="edit-button" text @click="salvarHospede">{{
          editMode ? "Atualizar" : "Gravar"
        }}</v-btn>
        <v-btn class="delete-button" text @click="closeDialog">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
import Swal from "sweetalert2";

export default {
  props: {
    hospedeParaEditar: Object,
  },
  data() {
    return {
      dialog: false,
      valid: false,
      editMode: false,
      flats: [], // Lista de flats
      hospede: this.getDefaultHospede(),
      nameRules: [
        (v) => !!v || "Nome é obrigatório",
        (v) => (v && v.length >= 3) || "Nome deve ter mais de 2 caracteres",
        (v) => (v && v.length <= 50) || "Nome deve ter menos de 50 caracteres",
      ],
      cpfCnpjRules: [
        (v) => !!v || "CPF é obrigatório",
        (v) => (v && v.length === 11) || "CPF deve ter 11 caracteres",
      ],
      emailRules: [(v) => !v || /.+@.+/.test(v) || "E-mail deve ser válido"],
      telefoneRules: [
        (v) => !!v || "Telefone é obrigatório",
        (v) =>
          (v && v.length >= 8 && v.length <= 15) ||
          "Telefone deve ter entre 8 e 15 caracteres",
      ],
      flatIdRules: [(v) => !!v || "Local da Hospedagem é obrigatório"],
    };
  },
  methods: {
    async fetchFlats() {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/flats/listar",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );
      this.flats = response.data;
    } catch (error) {
      console.error("Erro ao buscar flats:", error);
    }
  },
  async fetchHospedes() {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/hospedes/listar",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );
      this.hospedes = response.data.map(hospede => {
        const flat = this.flats.find(flat => flat.id === hospede.flatId);
        return {
          ...hospede,
          flatName: flat ? flat.nome : 'N/A'
        };
      });
    } catch (error) {
      console.error("Erro ao buscar hóspedes:", error);
    }
  },
  formatDateToBrazilian(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  },
  async salvarHospede() {
    if (this.$refs.form.validate()) {
      try {
        // Formatar as datas para o formato esperado pelo backend
        this.hospede.dataEntrada = this.formatDateToBrazilian(this.hospede.dataEntrada);
        this.hospede.dataSaida = this.formatDateToBrazilian(this.hospede.dataSaida);

        if (this.editMode) {
          await axios.post(
            `/api/hospedes/${this.hospede.id}/atualizar`,
            this.hospede,
          );
        } else {
          await axios.post(
            "http://localhost:8080/api/hospedes/registrar",
            this.hospede,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
              },
            },
          );
        }
          this.closeDialog();
          this.$emit("hospedeAtualizado");
          this.fetchHospedes(); // Atualiza a lista de hóspedes após salvar/atualizar
          Swal.fire(
            "Sucesso!",
            this.editMode
              ? "Hóspede atualizado com sucesso!"
              : "Hóspede cadastrado com sucesso!",
            "success",
          );
        } catch (error) {
          console.error("Erro ao processar o hóspede:", error);
          Swal.fire(
            "Erro!",
            "Ocorreu um erro ao processar o hóspede. Por favor, tente novamente.",
            "error",
          );
        }
      }
    },
    closeDialog() {
      this.dialog = false;
      this.resetHospedeForm();
    },
    resetHospedeForm() {
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
      this.hospede = this.getDefaultHospede();
      this.valid = false;
    },
    openDialog(edit = false) {
      this.editMode = edit;
      this.dialog = true;
      if (edit && this.hospedeParaEditar) {
        this.hospede = { ...this.hospedeParaEditar };
      } else {
        this.hospede = this.getDefaultHospede();
      }
    },
    getDefaultHospede() {
      return {
        nome: "",
        cpf: "",
        email: "",
        telefone: "",
        flatId: "",
        FlatName:"",
        dataEntrada: new Date().toISOString().substr(0, 10),
        dataSaida: "",
      };
    },
    
    ...mapActions(["fetchHospedes"]),
  },
  watch: {
    hospedeParaEditar(newValue) {
      if (newValue) {
        this.hospede = { ...newValue };
        this.editMode = true;
      } else {
        this.editMode = false;
        this.resetHospedeForm();
      }
    },
  },
  created() {
    this.fetchHospedes();
    this.fetchFlats(); // Busca a lista de flats
    if (this.hospedeParaEditar) {
      this.hospede = { ...this.hospedeParaEditar };
      this.editMode = true;
    }
  },
};
</script>
