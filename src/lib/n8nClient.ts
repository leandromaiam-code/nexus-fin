import { supabase } from '@/integrations/supabase/client';

const N8N_WEBHOOK_PREFIX = 'https://n8n-n8n.ajpgd7.easypanel.host/webhook/';

/**
 * Função genérica para executar ações de negócio no n8n de forma segura.
 * Ela obtém o token de sessão do usuário atual e o envia no cabeçalho,
 * permitindo que o n8n valide a identidade do usuário.
 *
 * @param action_type O tipo de ação a ser executada (ex: 'DELETE_ACCOUNT').
 * @param payload Os dados necessários para a ação.
 */
export const executeWebAction = async (action_type: string, payload: any = {}) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Usuário não autenticado.');
  }

  const response = await fetch(N8N_WEBHOOK_PREFIX + 'web-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Envia o token JWT do usuário para validação no n8n
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      action_type,
      payload
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(errorData.message || 'Ocorreu um erro na execução da ação.');
  }

  return response.json();
};

/**
 * Função específica para o registro de despesas, que usa o endpoint principal.
 * @param text O texto da despesa.
 * @param phoneNumber O número de telefone do usuário.
 * @param authToken O token de acesso da sessão do usuário.
 */
export const sendExpenseToN8n = async (text: string, phoneNumber: string, authToken: string) => {
    const response = await fetch(N8N_WEBHOOK_PREFIX + 'whatsapp-inbound', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        // Monta o payload imitando a Evolution API, como especificado
        body: JSON.stringify({
            sender: `${phoneNumber}@s.whatsapp.net`,
            message: {
                conversation: text
            }
        })
    });

    if (!response.ok) {
        throw new Error('Erro ao enviar despesa para processamento.');
    }

    return response.json();
};

/**
 * Função para enviar dados do onboarding para processamento no n8n.
 * @param personalData Dados pessoais do usuário
 * @param diagnosticAnswers Respostas do diagnóstico financeiro
 * @param authToken Token de acesso da sessão do usuário
 */
export const sendOnboardingToN8n = async (
    personalData: any, 
    diagnosticAnswers: any, 
    authToken?: string
) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(N8N_WEBHOOK_PREFIX + 'start-onboarding', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            personal_data: personalData,
            diagnostic_answers: diagnosticAnswers
        })
    });

    if (!response.ok) {
        throw new Error('Erro ao processar onboarding.');
    }

    return response.json();
};
