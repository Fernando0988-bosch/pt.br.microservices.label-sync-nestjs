import { ErrorCode } from './error-codes';

export const ErrorMessages: Record<ErrorCode, string> = {
  // Client errors
  [ErrorCode.BAD_REQUEST]: 'Requisição inválida',
  [ErrorCode.UNAUTHORIZED]: 'Não autorizado',
  [ErrorCode.FORBIDDEN]: 'Acesso negado',
  [ErrorCode.NOT_FOUND]: 'Recurso não encontrado',
  [ErrorCode.METHOD_NOT_ALLOWED]: 'Método não permitido',
  [ErrorCode.CONFLICT]: 'Conflito ao processar requisição',
  [ErrorCode.UNPROCESSABLE_ENTITY]: 'Dados não podem ser processados',
  [ErrorCode.TOO_MANY_REQUESTS]: 'Muitas requisições. Tente novamente mais tarde',

  // Business logic errors
  [ErrorCode.VALIDATION_ERROR]: 'Erro de validação dos dados',
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 'Violação de regra de negócio',
  [ErrorCode.INSUFFICIENT_RESOURCES]: 'Recursos insuficientes para completar a operação',
  [ErrorCode.OPERATION_NOT_ALLOWED]: 'Operação não permitida no contexto atual',
  [ErrorCode.DUPLICATE_ENTRY]: 'Registro já existe no sistema',

  // Integration errors
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'Erro de comunicação com serviço externo',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Serviço temporariamente indisponível',
  [ErrorCode.GATEWAY_TIMEOUT]: 'Tempo limite de resposta excedido',
  [ErrorCode.INTEGRATION_ERROR]: 'Erro de integração com sistema externo',
  [ErrorCode.TIMEOUT_ERROR]: 'Operação excedeu o tempo limite',

  // Data errors
  [ErrorCode.DATA_NOT_FOUND]: 'Dados solicitados não encontrados',
  [ErrorCode.DATA_INTEGRITY_ERROR]: 'Erro de integridade dos dados',
  [ErrorCode.INVALID_DATA_FORMAT]: 'Formato de dados inválido',

  // Authentication/Authorization
  [ErrorCode.INVALID_CREDENTIALS]: 'Credenciais de acesso inválidas',
  [ErrorCode.TOKEN_EXPIRED]: 'Token de acesso expirado',
  [ErrorCode.INVALID_TOKEN]: 'Token de acesso inválido',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Permissões insuficientes para esta operação',

  // RabbitMQ specific
  [ErrorCode.QUEUE_NOT_FOUND]: 'Fila de mensagens não encontrada',
  [ErrorCode.MESSAGE_PROCESSING_ERROR]: 'Erro no processamento da mensagem',
  [ErrorCode.QUEUE_CONNECTION_ERROR]: 'Erro de conexão com o sistema de filas',

  // SAP specific
  [ErrorCode.SAP_CONNECTION_ERROR]: 'Erro de conexão com sistema SAP',
  [ErrorCode.SAP_DATA_SYNC_ERROR]: 'Erro na sincronização de dados com SAP',
  [ErrorCode.SAP_AUTHENTICATION_ERROR]: 'Falha na autenticação com sistema SAP',

  // Label/Print specific
  [ErrorCode.LABEL_TEMPLATE_NOT_FOUND]: 'Modelo de etiqueta não encontrado',
  [ErrorCode.PRINT_JOB_FAILED]: 'Falha na execução do trabalho de impressão',
  [ErrorCode.PRINTER_NOT_AVAILABLE]: 'Impressora não está disponível',
  [ErrorCode.INVALID_LABEL_FORMAT]: 'Formato de etiqueta não suportado',
};
