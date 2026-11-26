# Revisão de pull requests no JogaBola

Usa o `AGENTS.md` para as convenções do repositório. Escreve a revisão em
português europeu e aponta cada problema à linha alterada que o provoca.
Explica a consequência para quem usa ou opera o produto e as condições em que
ocorre. Dá prioridade a regressões verificáveis e a problemas de integridade
dos dados ou de autorização.

- **Permissões.** Confirma que as Server Actions obtêm a identidade da sessão
  e validam o acesso à equipa ou ao clube no servidor. Revê também os limites
  de acesso em tarefas assíncronas e nas ações dos agentes.
- **PostgreSQL.** Verifica a atualização de bases com dados, as restrições, a
  repetição segura e o efeito de uma falha parcial. Confirma que as migrações
  novas preservam o SQL já aplicado e registado.
- **Percursos.** Confirma que a alteração preserva os percursos de convocatória,
  reservas e pagamentos que toca. Quando há novas chaves de tradução, verifica
  a paridade entre PT, EN, ES e FR.
- **GitHub Actions.** Confirma que os checks exercitam a alteração proposta e
  que os dados e credenciais usados em testes são de ambientes descartáveis.

Se uma conclusão depender de execução ou de dados indisponíveis, identifica
essa limitação na revisão.
