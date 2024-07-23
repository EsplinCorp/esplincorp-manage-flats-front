<template>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Novo Flat</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="flat.nome"
              label="Nome do Flat"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-model="flat.local"
              label="Localização"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-model="flat.endereco"
              label="Endereço"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-model="flat.quantidadeHospedesSuportados"
              label="Capacidade (hóspedes)"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model="flat.quantidadeFlatsDisponiveis"
              label="Flats Disponíveis"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="close" color="blue darken-1" text>Cancelar</v-btn>
          <v-btn @click="save" color="blue darken-1">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        dialog: false,
        valid: false,
        flat: {
          nome: '',
          local: '',
          endereco: '',
          quantidadeHospedesSuportados: 0,
          quantidadeFlatsDisponiveis: 0
        },
        rules: {
          required: value => !!value || 'Este campo é obrigatório',
          number: value => !isNaN(value) || 'Deve ser um número'
        }
      };
    },
    methods: {
      openDialog() {
        this.dialog = true;
      },
      close() {
        this.dialog = false;
        this.resetForm();
      },
      save() {
        if (this.$refs.form.validate()) {
          axios
            .post('http://localhost:8080/api/flats/registrar', this.flat, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`
              }
            })
            .then(response => {
              this.$emit('flatAdded', response.data);
              this.close();
            })
            .catch(error => {
              console.error('Erro ao adicionar flat:', error);
            });
        }
      },
      resetForm() {
        this.flat = {
          nome: '',
          local: '',
          endereco: '',
          quantidadeHospedesSuportados: 0,
          quantidadeFlatsDisponiveis: 0
        };
        this.$refs.form.resetValidation();
      }
    }
  };
  </script>
  