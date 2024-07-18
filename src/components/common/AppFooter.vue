<template>
  <v-footer padless fixed>
    <v-col class="footer-content" cols="12">
      © {{ currentYear }} - Esplin Software | Direitos Reservados
      <v-img
        class="footer-logo"
        src=""
        max-height="100%"
        max-width="20px"
      ></v-img>
    </v-col>
  </v-footer>
</template>

<script>
export default {
  name: "FooterComponent",
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
  },
};
</script>

<style scoped>
.footer-content {
  font-size: 13px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: right;
  color: #f17ea1;
  background-color: #f17ea1; /* Cor de fundo aplicada tanto para o tema claro quanto para o escuro */
  position: relative;
}

.footer-content::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #f17ea1; /* Linha decorativa aplicada em ambos os temas */
}

.footer-logo {
  height: auto;
  max-width: 100px;
  margin-left: auto;
}
</style>
