import Vue from "vue";
import Router from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import HospedesTable from "@/components/clients/HospedesTable.vue";
import HospedeManager from "@/views/HospedeManager.vue";
import NotFoundComponents from "@/views/NotFoundComponents.vue";
import FinancasView from "@/views/FinancasView.vue";
import PagamentosView from "@/views/PagamentosView.vue";
import FlatsView from "@/views/FlatsView.vue";
import ReceitasDespesasView from "@/views/ReceitasDespesasView.vue";
import BalancoView from "@/views/BalancoView.vue";
import RelatoriosView from "@/views/RelatoriosView.vue";
import LoginUser from '@/views/LoginUser.vue';

Vue.use(Router);

// Verifica se o usuário está logado
function isLoggedIn() {
    return !!localStorage.getItem('userToken');
}

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
        path: '/login',
        name: 'loginUser',
        component: LoginUser
    },
    {
      path: "/",
      name: "dashboardView",
      component: DashboardView,
      meta: { requiresAuth: true }

    },
    {
      path: "/hospedes",
      name: "Hospedes",
      component: HospedesTable,
      meta: { requiresAuth: true }

    },
    {
      path: "/gerenciar-hospedes",
      name: "HospedeManager",
      component: HospedeManager,
      meta: { requiresAuth: true }

    },
    {
      path: "/flats",
      name: "flats",
      component: FlatsView,
      meta: { requiresAuth: true }

    },
    {
      path: "/financas",
      name: "financas",
      component: FinancasView,
      meta: { requiresAuth: true }

    },
    {
      path: "/financas/receitas-despesas",
      name: "receitas-despesas",
      component: ReceitasDespesasView,
      meta: { requiresAuth: true }

    },
    {
      path: "/financas/balanco",
      name: "balanco",
      component: BalancoView,
      meta: { requiresAuth: true }

    },
    {
      path: "/financas/pagamento-funcionarios",
      name: "pagamentos",
      component: PagamentosView,
      meta: { requiresAuth: true }

    },
    {
      path: "/relatorios",
      name: "Relatorios",
      component: RelatoriosView,
      meta: { requiresAuth: true }

    },
    {
      path: "/404",
      alias: "*",
      name: "NotFound",
      component: NotFoundComponents,
      meta: { requiresAuth: true }

    },
  ],
});

// Guard global para verificar a autenticação antes de cada navegação de rota (Navegation Guard)
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn()) {
        next({ name: 'loginUser' });
    } else {
        next();
    }
});

export default router;
