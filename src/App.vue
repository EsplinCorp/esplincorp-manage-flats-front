<template>
  <v-app :dark="darkTheme">
    <!-- Menu Lateral -->
    <v-navigation-drawer
      v-if="shouldShowNavBar"
      v-model="drawer"
      :mini-variant="drawer"
      app
      permanent
      class="my-drawer"
      width="220"
    >
      <v-list class="d-flex flex-column fill-height compact-menu">
        <!-- Itens principais do menu -->
        <div class="flex-grow-1">
          <v-list-item
            :class="{ 'selected-item': isSelected('/') }"
            @click="navigateTo('/')"
          >
            <v-tooltip v-if="drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <span
                    v-html="octicons.graph.toSVG({ class: 'octicon' })"
                  ></span>
                </v-list-item-icon>
              </template>
              <span>Dashboard</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <span v-html="octicons.graph.toSVG({ class: 'octicon' })"></span>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Dashboard</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            :class="{ 'selected-item': isSelected('/reservas') }"
            @click="navigateTo('/reservas')"
          >
            <v-tooltip v-if="drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <span
                    v-html="octicons.calendar.toSVG({ class: 'octicon' })"
                  ></span>
                </v-list-item-icon>
              </template>
              <span>Reservas</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <span
                v-html="octicons.calendar.toSVG({ class: 'octicon' })"
              ></span>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Reservas</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            :class="{ 'selected-item': isSelected('/financas') }"
            @click="navigateTo('/financas')"
          >
            <v-tooltip v-if="drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <span
                    v-html="octicons.database.toSVG({ class: 'octicon' })"
                  ></span>
                </v-list-item-icon>
              </template>
              <span>Finanças</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <span
                v-html="octicons.database.toSVG({ class: 'octicon' })"
              ></span>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Finanças</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            :class="{ 'selected-item': isSelected('/lembretes') }"
            @click="navigateTo('/lembretes')"
          >
            <v-tooltip v-if="drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <span
                    v-html="octicons.bell.toSVG({ class: 'octicon' })"
                  ></span>
                </v-list-item-icon>
              </template>
              <span>Lembretes</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <span v-html="octicons.bell.toSVG({ class: 'octicon' })"></span>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Lembretes</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>

        <!-- Botões e Perfil no final do menu lateral -->
        <div class="mt-auto">
          <v-divider></v-divider>
          <v-list-item @click="toggleDrawer" class="menu-bottom-item">
            <v-tooltip v-if="drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <span
                    v-html="
                      octicons['sidebar-collapse'].toSVG({ class: 'octicon' })
                    "
                  ></span>
                </v-list-item-icon>
              </template>
              <span>{{ drawer ? "Expandir Menu" : "Recolher Menu" }}</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <span
                v-html="octicons['sidebar-expand'].toSVG({ class: 'octicon' })"
              ></span>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{
                drawer ? "Expandir Menu" : "Recolher Menu"
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="toggleDarkTheme" class="menu-bottom-item">
            <v-tooltip v-if="drawer" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-icon v-bind="attrs" v-on="on">
                  <span
                    v-html="
                      darkTheme
                        ? octicons.sun.toSVG({ class: 'octicon' })
                        : octicons.moon.toSVG({ class: 'octicon' })
                    "
                  ></span>
                </v-list-item-icon>
              </template>
              <span>{{
                darkTheme ? "Ativar Modo Claro" : "Ativar Modo Escuro"
              }}</span>
            </v-tooltip>
            <v-list-item-icon v-else>
              <span
                v-html="
                  darkTheme
                    ? octicons.sun.toSVG({ class: 'octicon' })
                    : octicons.moon.toSVG({ class: 'octicon' })
                "
              ></span>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{
                darkTheme ? "Ativar Modo Claro" : "Ativar Modo Escuro"
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>

          <!-- Perfil do usuário (estilo GitHub) -->
          <v-menu
            v-model="profileMenu"
            :close-on-content-click="true"
            :close-on-click="true"
            offset-y
            bottom
            left
          >
            <template v-slot:activator="{ on, attrs }">
              <v-list-item v-bind="attrs" v-on="on" class="github-profile-item">
                <v-list-item-avatar size="32" class="profile-avatar-fixed">
                  <v-avatar color="primary" v-if="!userProfileImage" size="32">
                    <span class="white--text caption">{{ userInitial }}</span>
                  </v-avatar>
                  <v-avatar v-else size="32">
                    <v-img
                      :src="userProfileImage"
                      :key="'menu-' + imageKey + '-' + profileImageVersion"
                      @error="handleImageError"
                    ></v-img>
                  </v-avatar>
                </v-list-item-avatar>
                <v-list-item-content
                  v-if="!drawer"
                  class="github-profile-content"
                >
                  <v-list-item-title class="subtitle-2">{{
                    userName
                  }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-icon v-if="!drawer" class="github-profile-icon">
                  <span
                    v-html="octicons.gear.toSVG({ class: 'octicon' })"
                  ></span>
                </v-list-item-icon>
              </v-list-item>
            </template>

            <v-card class="github-profile-menu">
              <v-list dense>
                <v-list-item @click="openProfileDialog">
                  <v-list-item-icon class="mr-2">
                    <span
                      v-html="octicons.person.toSVG({ class: 'octicon' })"
                    ></span>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Alterar foto</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="performLogout">
                  <v-list-item-icon class="mr-2">
                    <span
                      v-html="octicons['sign-out'].toSVG({ class: 'octicon' })"
                    ></span>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Sair</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </v-list>
    </v-navigation-drawer>

    <!-- Conteúdo Principal -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Dialog para editar foto de perfil -->
    <v-dialog v-model="profileDialog" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Foto de Perfil</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" class="text-center">
                <v-avatar
                  size="100"
                  color="primary"
                  v-if="!userProfileImage && !previewImage"
                  class="profile-avatar"
                  @click="triggerFileInput"
                >
                  <span class="white--text text-h4">{{ userInitial }}</span>
                  <div class="avatar-overlay">
                    <v-icon color="white">mdi-camera</v-icon>
                  </div>
                </v-avatar>
                <v-avatar
                  size="100"
                  v-else
                  class="profile-avatar"
                  @click="triggerFileInput"
                >
                  <v-img
                    :src="currentProfileImage"
                    :key="'dialog-' + imageKey + '-' + profileImageVersion"
                    @error="handleImageError"
                  ></v-img>
                  <div class="avatar-overlay">
                    <v-icon color="white">mdi-camera</v-icon>
                  </div>
                </v-avatar>
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  style="display: none"
                  @change="onFileInputChange"
                />
              </v-col>
              <v-col cols="12" v-if="userProfileImage || previewImage">
                <v-btn
                  class="action-button"
                  color="error"
                  block
                  @click="removeProfileImage"
                >
                  Remover foto
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="action-button"
            color="blue darken-1"
            text
            @click="profileDialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { mapActions, mapState } from "vuex";
import * as octicons from "@primer/octicons";
import "./styles/global.css";

export default {
  components: {},
  data() {
    return {
      octicons,
      drawer: false,
      darkTheme: JSON.parse(localStorage.getItem("darkTheme")) || false,
      dialog: false,
      snackbar: false,
      titulo: "",
      conteudo: "",
      valid: false,
      rules: {
        required: (value) => !!value || "Campo obrigatório",
      },
      profileDialog: false,
      profileMenu: false,
      previewImage: null,
      selectedFile: null,
      imageKey: 0,
      profileImageVersion: 0,
    };
  },
  created() {
    this.$vuetify.theme.dark = this.darkTheme;
    this.updateCssVariables();
    this.profileMenu = false; // Garante que o menu começa fechado
    this.loadUserProfile();

    // Log dos nomes dos ícones disponíveis para referência
    console.log("Octicons disponíveis:", Object.keys(this.octicons));
  },
  computed: {
    ...mapState({
      user: (state) => state.user,
    }),
    currentYear() {
      return new Date().getFullYear();
    },
    isMobile() {
      return this.$vuetify.breakpoint.xsOnly;
    },
    shouldShowNavBar() {
      const isAuthenticated = !!localStorage.getItem("userToken");
      const isLoginRoute = this.$route.name === "loginUser";
      return isAuthenticated && !isLoginRoute;
    },
    userName() {
      let fullName = "";

      if (this.user && this.user.nome) {
        fullName = this.user.nome;
      } else {
        // Tentar obter o nome do usuário do localStorage
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
          try {
            const userData = JSON.parse(userInfo);
            fullName = userData.nome || "Usuário";
          } catch (e) {
            console.error("Erro ao analisar userInfo:", e);
            return "Usuário";
          }
        } else {
          return "Usuário";
        }
      }

      // Retornar apenas o primeiro nome
      return fullName.split(" ")[0];
    },
    userInitial() {
      return this.userName ? this.userName.charAt(0).toUpperCase() : "U";
    },
    userProfileImage() {
      this.profileImageVersion;
      return localStorage.getItem("userProfileImage");
    },
    currentProfileImage() {
      return this.previewImage || this.userProfileImage || null;
    },
  },
  watch: {
    drawer() {
      this.profileMenu = false; // Fecha o menu quando o drawer muda
    },
    darkTheme(newVal) {
      this.$vuetify.theme.dark = newVal;
      localStorage.setItem("darkTheme", JSON.stringify(newVal));
      this.updateCssVariables();
    },
  },
  methods: {
    ...mapActions(["loginUser", "logoutUser"]),

    loadUserProfile() {
      const userInfo = localStorage.getItem("userInfo");
      this.profileMenu = false; // Reset do menu ao carregar o perfil
      if (userInfo) {
        try {
          const userData = JSON.parse(userInfo);
          this.$store.commit("SET_USER", userData);

          // Carregar imagem de perfil
          const profileImage = localStorage.getItem("userProfileImage");
          if (profileImage) {
            const img = new Image();
            img.onload = () => {
              console.log("Imagem de perfil carregada com sucesso");
              this.$forceUpdate();
            };
            img.onerror = () => {
              console.error("Erro ao carregar imagem de perfil");
              localStorage.removeItem("userProfileImage");
              this.$forceUpdate();
            };
            img.src = profileImage;
          }
        } catch (e) {
          console.error("Erro ao carregar dados do usuário:", e);
        }
      }
    },

    openProfileDialog() {
      this.profileDialog = true;
      this.previewImage = null;
      this.selectedFile = null;
    },

    onFileInputChange(event) {
      const file = event.target.files[0];
      if (file) {
        console.log("Arquivo selecionado:", file.name);

        // Verificar se o arquivo é uma imagem
        if (!file.type.startsWith("image/")) {
          console.error("O arquivo selecionado não é uma imagem");
          alert("Por favor, selecione apenas arquivos de imagem.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          console.log("Imagem carregada com sucesso");
          this.previewImage = e.target.result;
          this.selectedFile = file;

          // Incrementar as chaves antes de salvar
          this.imageKey++;
          this.profileImageVersion++;

          // Forçar atualização antes de salvar
          this.$nextTick(() => {
            this.saveProfileImage();
          });
        };

        reader.onerror = (error) => {
          console.error("Erro ao ler o arquivo:", error);
          alert("Erro ao processar a imagem. Tente novamente.");
        };

        reader.readAsDataURL(file);
      } else {
        console.error("Nenhum arquivo selecionado");
      }
    },

    handleImageError() {
      console.error("Erro ao carregar imagem de perfil");
      localStorage.removeItem("userProfileImage");
      this.$forceUpdate();
    },

    removeProfileImage() {
      this.previewImage = null;
      this.selectedFile = null;
      localStorage.removeItem("userProfileImage");
      this.imageKey++;
      this.profileImageVersion++;
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },

    saveProfileImage() {
      if (this.previewImage) {
        console.log("Iniciando salvamento da imagem...");
        try {
          this.compressAndSaveImage();
        } catch (e) {
          console.error("Erro ao comprimir imagem:", e);
          try {
            console.log("Tentando salvar imagem original...");
            localStorage.setItem("userProfileImage", this.previewImage);
            this.imageKey++;
            this.profileImageVersion++;
            this.$nextTick(() => {
              console.log("Forçando atualização da interface");
              this.$forceUpdate();
            });
            console.log("Imagem de perfil salva com sucesso");
          } catch (e) {
            console.error("Erro ao salvar imagem original:", e);
            alert("Não foi possível salvar a imagem. Tente uma imagem menor.");
          }
        }
      } else {
        console.error("Nenhuma imagem para salvar");
      }
    },

    compressAndSaveImage() {
      if (!this.previewImage) {
        console.error("Nenhuma imagem para comprimir");
        return;
      }

      console.log("Iniciando compressão da imagem...");
      const img = new Image();

      img.onload = () => {
        console.log("Imagem carregada para compressão");
        const maxWidth = 150;
        const maxHeight = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        console.log(`Redimensionando para ${width}x${height}`);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const compressedImage = canvas.toDataURL("image/jpeg", 0.8);
        console.log("Imagem comprimida com sucesso");

        try {
          localStorage.setItem("userProfileImage", compressedImage);
          console.log("Imagem salva no localStorage");

          this.previewImage = compressedImage;
          this.imageKey++;
          this.profileImageVersion++;

          this.$nextTick(() => {
            console.log("Atualizando interface");
            this.$forceUpdate();
          });
        } catch (e) {
          console.error("Erro ao salvar no localStorage:", e);
          alert("Erro ao salvar a imagem. Tente uma imagem menor.");
        }
      };

      img.onerror = (error) => {
        console.error("Erro ao carregar imagem para compressão:", error);
        alert("Erro ao processar a imagem. Tente novamente.");
      };

      img.src = this.previewImage;
    },

    updateCssVariables() {
      // Define CSS variables based on Vuetify theme
      const primaryColor = this.darkTheme
        ? this.$vuetify.theme.themes.dark.primary
        : this.$vuetify.theme.themes.light.primary;

      const secondaryColor = this.darkTheme
        ? this.$vuetify.theme.themes.dark.secondary
        : this.$vuetify.theme.themes.light.secondary;

      document.documentElement.style.setProperty(
        "--primary-color",
        primaryColor,
      );
      document.documentElement.style.setProperty(
        "--secondary-color",
        secondaryColor,
      );
    },

    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    toggleDarkTheme() {
      this.darkTheme = !this.darkTheme;
    },
    performLogout() {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userProfileImage");
      this.$store.commit("CLEAR_USER_DATA");
      this.$router.push("/login");
    },
    resetForm() {
      this.$refs.form.reset();
    },
    submitFeedback() {
      if (this.$refs.form.validate()) {
        const feedback = {
          titulo: this.titulo,
          conteudo: this.conteudo,
        };
        console.log(feedback);
        this.dialog = false;
        this.snackbar = true;
        this.resetForm();
      }
    },
    navigateTo(route) {
      if (this.$route.path !== route) {
        this.$router.push(route);
      }
    },
    isSelected(route) {
      return this.$route.path === route;
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
  },
};
</script>

<style>
/* Definições globais que devem aplicar-se a toda a aplicação */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #616161;
}

.font-weight-normal {
  font-weight: normal !important;
}

.primary--text {
  color: var(--primary-color) !important;
}

/* Estilo para os octicons */
.octicon {
  fill: currentColor;
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.theme--dark .octicon {
  fill: #fff;
}
</style>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  transition: margin-left 0.3s;
}

.menu-item {
  margin-bottom: 16px;
}

.fill-height {
  height: 100%;
}

.compact-menu .v-list-item__icon {
  margin-right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-drawer {
  background-color: #f8f9fa;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.theme--dark .my-drawer {
  background-color: #000000;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.selected-item {
  background-color: rgba(66, 153, 225, 0.1);
  border-left: 3px solid var(--primary-color);
}

.v-list {
  padding-top: 0 !important;
}

.v-navigation-drawer .v-list {
  padding: 0;
}

.flex-grow-1 .v-list-item:first-child {
  margin-top: 0;
}

.user-profile-container {
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.theme--dark .user-profile-container {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.v-avatar {
  cursor: pointer;
  transition: transform 0.2s;
}

.v-avatar:hover {
  transform: scale(1.05);
}

.v-list-item-avatar {
  min-width: 40px !important;
  margin-right: 16px !important;
}

.avatar-centered {
  margin: 0 auto !important;
  display: flex;
  justify-content: center;
}

.v-navigation-drawer--mini-variant .avatar-centered {
  margin-right: 0 !important;
  margin-left: 0 !important;
}

.user-content {
  min-width: 0;
  flex: 1;
  padding-left: 16px;
}

.user-name-container {
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 12px;
}

.edit-profile-btn {
  margin-left: 8px;
  flex-shrink: 0;
}

.profile-avatar {
  position: relative;
  cursor: pointer;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.profile-avatar:hover .avatar-overlay {
  opacity: 1;
}

.github-profile-item {
  padding: 12px 16px;
  min-height: 48px;
  transition: background-color 0.2s;
  position: relative;
  display: flex;
  align-items: center;
}

.github-profile-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.github-profile-item:active {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
}

.github-profile-content {
  min-width: 0;
  flex: 1;
  padding-left: 8px;
}

.github-profile-content .v-list-item-title {
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.github-profile-icon {
  margin-left: auto;
  min-width: 24px !important;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.github-profile-item:hover .github-profile-icon {
  opacity: 0.7;
}

.v-navigation-drawer--mini-variant .github-profile-item {
  justify-content: center;
  padding: 12px 0;
}

.v-navigation-drawer--mini-variant .v-list-item-avatar {
  margin-right: 0 !important;
}

.github-profile-menu {
  min-width: 200px;
}

.github-profile-menu .v-list-item {
  min-height: 40px;
}

.github-profile-menu .v-list-item-icon {
  margin-right: 12px !important;
  min-width: 24px !important;
}

.github-profile-menu .v-list-item-title {
  font-size: 14px;
}

.github-profile-menu .octicon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.profile-avatar-fixed {
  margin: 0 !important;
  min-width: 32px !important;
  width: 32px !important;
}

.v-navigation-drawer--mini-variant .profile-avatar-fixed {
  margin: 0 auto !important;
}

.github-profile-item .v-list-item-avatar {
  margin-right: 8px !important;
}
</style>
