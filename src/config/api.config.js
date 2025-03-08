/**
 * Configuração centralizada para URLs da API
 */

// URL base da API
export const API_URL = "https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com";

// URLs específicas
export const API_ENDPOINTS = {
    // Flats
    FLATS_LISTAR: `${API_URL}/api/flats/listar`,
    FLATS_REGISTRAR: `${API_URL}/api/flats/registrar`,
    FLATS_ATUALIZAR: (id) => `${API_URL}/api/flats/${id}/atualizar`,
    FLATS_EXCLUIR: (id) => `${API_URL}/api/flats/${id}`,
    FLATS_HISTORICO: (id) => `${API_URL}/api/flats/${id}/historico`,

    // Hóspedes
    HOSPEDES_LISTAR: `${API_URL}/api/hospedes/listar`,
    HOSPEDES_REGISTRAR: `${API_URL}/api/hospedes/registrar`,
    HOSPEDES_ATUALIZAR: (id) => `${API_URL}/api/hospedes/${id}/atualizar`,
    HOSPEDES_EXCLUIR: (id) => `${API_URL}/api/hospedes/${id}`,

    // Reservas
    RESERVAS_LISTAR: `${API_URL}/api/reservas/listar`,
    RESERVAS_ATIVAS: `${API_URL}/api/reservas/ativas`,

    // Transações
    TRANSACOES_LISTAR: `${API_URL}/api/transacoes/flat/all`,
    TRANSACOES_REGISTRAR: `${API_URL}/api/transacoes/registrar`,
    TRANSACOES_ATUALIZAR: (id) => `${API_URL}/api/transacoes/atualizar/${id}`,
    TRANSACOES_EXCLUIR: (id) => `${API_URL}/api/transacoes/excluir/${id}`,

    // Lembretes
    LEMBRETES_LISTAR: `${API_URL}/api/lembretes/listar`,
    LEMBRETES_REGISTRAR: `${API_URL}/api/lembretes/registrar`,
    LEMBRETES_ATUALIZAR: (id) => `${API_URL}/api/lembretes/atualizar/${id}`,
    LEMBRETES_EXCLUIR: (id) => `${API_URL}/api/lembretes/excluir/${id}`,
    LEMBRETES_STATUS: (id) => `${API_URL}/api/lembretes/${id}/status`,

    // Financeiro
    FINANCEIRO_EVOLUCAO: `${API_URL}/api/financeiro/evolucao/ultimos-6-meses`,
    INDICADORES_DESEMPENHO: `${API_URL}/api/indicadores/desempenho`,

    // Autenticação
    AUTH_VALIDAR: `${API_URL}/api/auth/validar`,
};

export default {
    API_URL,
    API_ENDPOINTS
}; 