# Publicação no servidor do IFSC

## Antes da primeira publicação

1. Copie `.env.example` para `.env` apenas no servidor e substitua todos os valores de exemplo.
2. Gere `JWT_SECRET` com pelo menos 32 caracteres aleatórios. Não salve o `.env` no Git.
3. Confirme que `DATABASE_URL` aponta para o banco existente e que `APP_ORIGIN` contém o endereço HTTPS público sem barra final.
4. Faça backup do banco e do volume `uploads_data`.

## Atualização segura

O fluxo de publicação constrói a nova imagem antes da troca, cria um backup SQL, executa somente as migrações pendentes e verifica `/api/health`. As migrações acrescentam estruturas; não removem as tabelas ou campos existentes.

Para uma publicação manual:

```sh
docker compose build
docker compose exec -T mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > backup.sql
docker compose run --rm app npx prisma migrate deploy
docker compose up -d --remove-orphans
curl --fail http://127.0.0.1:3000/api/health
```

## Primeiro gestor de acesso

No servidor, defina temporariamente `INITIAL_ADMIN_EMAIL` no ambiente e execute:

```sh
docker compose run --rm app npm run bootstrap-admin
```

O comando exibe um convite individual válido por 24 horas. Abra o link, defina a senha e depois remova `INITIAL_ADMIN_EMAIL` do ambiente. O e-mail não fica no código nem na documentação.

## Administração e idiomas

- `/admin`: conteúdo, convites e contas administrativas.
- `/admin/traducoes`: traduções de acervo, artigos, títulos e descrições de vídeos, além do glossário de nomes próprios.
- Português é o texto de origem. Inglês e espanhol só publicam conteúdo dinâmico marcado como revisado e ainda sincronizado com o original.
- Áudio e legendas de vídeos não são alterados.

## Recuperação

Se a aplicação não ficar saudável, preserve os registros de execução, volte ao commit anterior e execute `docker compose up -d`. Só restaure o backup SQL se uma análise confirmar que a migração alterou dados de forma indevida.
