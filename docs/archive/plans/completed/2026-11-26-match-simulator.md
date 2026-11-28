# Simulador de Jogo 3D

> Executar com Superpowers e verificar a experiência em desktop e telemóvel.

**Objetivo.** Permitir ao treinador experimentar uma formação, posições e substituições contra um adversário sintético e comparar cenários.

**Arquitetura.** Motor TypeScript determinístico no cliente. Reprodução no Three.js com vista tática 2D alternativa. Página protegida pela Arena, sem escrita ou leitura de dados competitivos neste protótipo.

- [x] Validar com Vitest o nível do adversário, a repetição com a mesma configuração e as substituições programadas e durante a partida.
- [x] Implementar o motor e a reprodução dos eventos com posições em metros.
- [x] Integrar a configuração, a reprodução e a comparação de cenários em `/arena/simulator`. Ligar a navegação da Arena e sincronizar PT, EN, ES e FR.
- [x] Executar lint, TypeScript, testes e build. Verificar configuração, comparação e reprodução em desktop e telemóvel.

O fluxo foi exercitado em Chrome com login OTP numa stack descartável, em desktop e telemóvel emulado. A suite Vitest executou 420 testes. O protótipo mantém cenários e a referência em memória na página.

## Futebol de 11 e de 7

O simulador oferece uma predefinição de 90 minutos em 105 × 68 m para futebol de 11 e outra de 60 minutos em 65 × 45 m para futebol de 7. Cada formato define o número de jogadores, as formações, o banco e as dimensões das balizas. Mudar o formato inicia um novo cenário e reinicia a referência de comparação.

A validação passou com 422 testes. O ensaio autenticado em Chrome cobriu a alternância durante a reprodução, a substituição aos 40 minutos em futebol de 7, os limites do relógio e a vista 3D em desktop e telemóvel emulado.
