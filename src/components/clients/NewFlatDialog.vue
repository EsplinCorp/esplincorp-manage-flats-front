<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title class="text-h5">
        <div class="flex-grow-1">
          {{ isEditing ? "Editar Flat" : "Novo Flat" }}
        </div>
        <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="flat.nome"
            :rules="rules.nome"
            label="Nome do Flat"
            required
          ></v-text-field>
          <v-text-field
            v-model="flat.local"
            :rules="rules.local"
            label="Localização"
            required
          ></v-text-field>
          <v-text-field
            v-model="flat.endereco"
            :rules="rules.endereco"
            label="Endereço"
            required
          ></v-text-field>
          <v-text-field
            v-model="flat.quantidadeHospedesSuportados"
            :rules="rules.quantidadeHospedesSuportados"
            label="Capacidade (hóspedes)"
            type="number"
            required
          ></v-text-field>
          <v-text-field
            v-model="flat.valorDiaria"
            :rules="rules.valorDiaria"
            label="Valor da diária R$"
            type="number"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="saveFlat" class="edit-button">{{
          isEditing ? "Atualizar" : "Gravar"
        }}</v-btn>
        <v-btn @click="closeDialog" class="delete-button" text>Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  props: {
    flatData: {
      type: Object,
      default: () => ({
        nome: "",
        local: "",
        endereco: "",
        quantidadeHospedesSuportados: 0,
        valorDiaria: 0,
      }),
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialog: false,
      valid: false,
      flat: { ...this.flatData },
      isEditingLocal: this.isEditing,
      rules: {
        nome: [
          (v) => !!v || "Nome é obrigatório",
          (v) => (v && v.length >= 3) || "Nome deve ter mais de 2 caracteres",
          (v) =>
            (v && v.length <= 50) || "Nome deve ter menos de 50 caracteres",
        ],
        local: [(v) => !!v || "Localização é obrigatória"],
        endereco: [(v) => !!v || "Endereço é obrigatório"],
        quantidadeHospedesSuportados: [
          (v) => !!v || "Capacidade é obrigatória",
          (v) => !isNaN(v) || "Deve ser um número",
        ],
        valorDiaria: [
          (v) => !!v || "O valor da diária é obrigatório",
          (v) => !isNaN(v) || "Deve ser um número",
        ],
      },
    };
  },
  methods: {
    openDialog() {
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
      this.resetForm();
    },
    saveFlat() {
      if (this.$refs.form.validate()) {
        const url = this.isEditingLocal
          ? `https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/flats/${this.flat.id}/atualizar`
          : "https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com/api/flats/registrar";
        const method = this.isEditingLocal ? "put" : "post";

        axios[method](url, this.flat, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        })
          .then((response) => {
            this.$emit("flatSaved", response.data);
            this.closeDialog();
            Swal.fire({
              title: "Sucesso!",
              text: this.editMode
                ? "Flat atualizado com sucesso!"
                : "Flat cadastrado com sucesso!",
              icon: "success",
              showConfirmButton: false,
              timer: 1200,
            });
          })
          .catch((error) => {
            console.error("Erro ao salvar flat:", error);
            Swal.fire(
              "Erro!",
              "Ocorreu um erro ao salvar o flat. Por favor, tente novamente.",
              "error",
            );
          });
      }
    },
    resetForm() {
      this.flat = { ...this.flatData };
      this.$refs.form.resetValidation();
    },
  },
  watch: {
    flatData(newValue) {
      if (newValue) {
        this.flat = { ...newValue };
        this.isEditingLocal = true;
      } else {
        this.isEditingLocal = false;
        this.resetForm();
      }
    },
  },
  created() {
    if (this.flatData) {
      this.flat = { ...this.flatData };
      this.isEditingLocal = true;
    }
  },
};
</script>
