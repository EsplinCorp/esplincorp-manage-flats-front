<template>
  <v-footer :class="{ 'footer-expanded': isMenuExpanded }" padless fixed>
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
  props: {
    isMenuExpanded: {
      type: Boolean,
      required: true,
    },
  },
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
  justify-content: center;
  position: relative;
}

.footer-content::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #006ee6 !important;
}

.v-footer {
  transition: margin-left 0.3s ease; /* Adicionar transição suave */
  margin-left: 56px;
}

.footer-expanded {
  margin-left: 220px;
}
</style>