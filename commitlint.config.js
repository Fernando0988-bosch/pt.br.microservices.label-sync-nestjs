module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nova funcionalidade
        'fix', // Correção de bug
        'docs', // Documentação
        'style', // Formatação, ponto e vírgula, etc
        'refactor', // Refatoração sem mudança de funcionalidade
        'perf', // Melhoria de performance
        'test', // Adição ou correção de testes
        'chore', // Tarefas de manutenção
        'ci', // Mudanças de CI
        'build', // Mudanças no build
        'revert', // Reverter commits
      ],
    ],
    'scope-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
