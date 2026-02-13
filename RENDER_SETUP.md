# Configuração para Render.com

## Passos para fazer deploy no Render:

1. **Criar um novo Web Service no Render:**
   - Vá para https://dashboard.render.com
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório Git (GitHub, GitLab, etc.)

2. **Configurações do Serviço:**
   - **Name**: armenu (ou o nome que preferir)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou o plano que preferir)

3. **Variáveis de Ambiente (opcional):**
   - NODE_ENV: production

4. **Importante:**
   - Certifique-se de que todos os arquivos estão commitados no Git:
     - `index.html`
     - `styles.css`
     - `app.js`
     - `server.js`
     - `package.json`
     - `pizza.glb` (e outros modelos .glb)
     - `render.yaml` (opcional, mas recomendado)

5. **Deploy:**
   - Clique em "Create Web Service"
   - O Render fará o build e deploy automaticamente
   - Aguarde alguns minutos para o primeiro deploy

## Verificações:

- ✅ O servidor Express está configurado para usar a porta dinâmica do Render
- ✅ Os arquivos estáticos (incluindo .glb) serão servidos corretamente
- ✅ CORS está configurado para permitir requisições
- ✅ MIME types corretos para arquivos .glb

## Problemas Comuns:

### Erro: "Cannot find module 'express'"
**Solução**: Certifique-se de que o `package.json` tem a dependência do Express e que o build command está rodando `npm install`

### Arquivos .glb não carregam
**Solução**: Verifique se o arquivo `pizza.glb` está commitado no repositório Git

### Porta não encontrada
**Solução**: O servidor já está configurado para usar `process.env.PORT` automaticamente

## Teste Local Antes do Deploy:

```bash
npm install
npm start
```

Acesse http://localhost:8000 para testar localmente.
