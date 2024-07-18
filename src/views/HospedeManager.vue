<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title class="text-h5">
        <div class="flex-grow-1">{{ editMode ? "Editar Hóspede" : "Novo Hóspede" }}</div>
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
        <v-btn text @click="salvarHospede">{{ editMode ? "Atualizar" : "Gravar" }}</v-btn>
        <v-btn text @click="closeDialog">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from "@/services/api/api.js";
import { mapActions } from "vuex";

export default {
  props: {
    hospedeParaEditar: Object,
  },
  data() {
    return {
      dialog: false,
      valid: false,
      editMode: false,
      locaisHospedagem: ["Ipanema", "Leblon", "Casa Cubo"],
      hospede: this.getDefaultHospede(),
      nameRules: [
        (v) => !!v || "Nome é obrigatório",
        (v) => (v && v.length >= 3) || "Nome deve ter mais de 2 caracteres",
        (v) => (v && v.length <= 50) || "Nome deve ter menos de 50 caracteres",
      ],
      cpfCnpjRules: [(v) => !!v || "CPF é obrigatório", (v) => (v && v.length === 11) || "CPF deve ter 11 caracteres"],
      emailRules: [(v) => !!v || "E-mail é obrigatório", (v) => /.+@.+/.test(v) || "E-mail deve ser válido"],
      telefoneRules: [
        (v) => !!v || "Telefone é obrigatório",
        (v) => (v && v.length >= 8 && v.length <= 15) || "Telefone deve ter entre 8 e 15 caracteres",
      ],
      localHospedagemRules: [(v) => !!v || "Local da Hospedagem é obrigatório"],
    };
  },
  methods: {
    salvarHospede() {
      if (this.$refs.form.validate()) {
        api.post("/api/hospedes/registrar", this.hospede)
          .then(() => {
            this.closeDialog();
            this.$emit("hospedeAtualizado");
            this.fetchHospedes(); // Atualiza a lista de hóspedes após salvar/atualizar
          })
          .catch((error) => {
            console.error("Erro ao processar o hóspede:", error);
          });
      }
    },
    closeDialog() {
      this.dialog = false;
      this.resetForm();
    },
    resetForm() {
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
        checkStatus: "Check-in",
        dataCadastro: new Date().toISOString().substr(0, 10),
        dataCheckIn: new Date().toISOString().substr(0, 10),
        dataCheckOut: "",
      };
    },
    ...mapActions(["fetchHospedes"]), // Mapeia a action fetchHospedes do Vuex para usar no componente
  },
  watch: {
    hospedeParaEditar(newValue) {
      if (newValue) {
        this.hospede = { ...newValue };
        this.editMode = true;
      } else {
        this.editMode = false;
        this.resetForm();
      }
    },
  },
  created() {
    this.fetchHospedes();
    if (this.hospedeParaEditar) {
      this.hospede = { ...this.hospedeParaEditar };
      this.editMode = true;
    }
  },
};
</script>
