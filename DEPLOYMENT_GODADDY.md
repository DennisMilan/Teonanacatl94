# Como Hospedar o Teonanacatl 94 no GoDaddy (Node.js cPanel)

Este guia prático explica o passo a passo para hospedar e rodar esta aplicação full-stack (React + Express) na Hospedagem GoDaddy compartilhada ou VPS que utiliza o painel **cPanel**.

---

## 📋 Pré-requisitos no cPanel da GoDaddy

Certifique-se de que seu plano de hospedagem GoDaddy possui suporte para **Node.js** (Geralmente disponível nos planos Web Hosting Plus ou VPS com cPanel / Seletor de Node.js).

---

## 🚀 Passo a Passo para Implantação

### Passo 1: Preparar os Arquivos para Upload

Você pode implantar a aplicação de forma extremamente simples, pois o projeto está pré-configurado para instalar as dependências e compilar o build de produção automaticamente diretamente no servidor GoDaddy:

#### Opção A: Deploy Prático (Recomendado - Build Automático no Servidor)
1. Crie um arquivo **`.zip`** com todo o código-fonte da raiz do projeto, **excluindo** apenas a pasta `node_modules` (e a pasta `dist` se já existir), para manter o arquivo leve.
2. Certifique-se de que o `.zip` contém:
   - As pastas `src/`, `audio/`, `Nanos/`
   - Os arquivos `package.json`, `app.js`, `server.ts`, `vite.config.ts`, `tsconfig.json`
   - Os arquivos `.png` e `.jpg` da raiz (como as imagens da banda)
3. Envie este arquivo `.zip` para a pasta destino na GoDaddy (via **Gerenciador de Arquivos** do cPanel ou por **FTP**) e extraia os arquivos.

#### Opção B: Build Local (Caso prefira enviar os arquivos já compilados)
1. No seu computador, execute o comando de compilação:
   ```bash
   npm run build
   ```
2. Compacte as seguintes pastas e arquivos compilados:
   - As pastas `dist/` (contém o frontend e o servidor `dist/server.cjs`) e `audio/`
   - A pasta `Nanos/` (com o arquivo `cadastro.csv`)
   - Os arquivos `app.js` e `package.json`
   - As imagens `.png` e `.jpg` da raiz do projeto
3. Suba o arquivo `.zip` gerado para o servidor GoDaddy e extraia na pasta destino.

---

### Passo 2: Criar e Configurar o Aplicativo Node.js no cPanel

1. Faça login no seu **cPanel da GoDaddy**.
2. Na barra de busca, procure por **"Setup Node.js App"** (ou "Configurar Aplicativo Node.js") na seção *Software*.
3. Clique em **"Create Application"** (Criar Aplicativo).
4. Preencha os campos conforme as instruções abaixo:
   - **Node.js version**: Selecione uma versão estável recomendada (ex: `18.x`, `20.x` ou superior).
   - **Application mode**: Selecione **`Production`** (Produção).
   - **Application root**: Digite o caminho da pasta onde você colocou os arquivos (ex: `teonanacatl-app` se subiu na raiz da sua conta).
   - **Application URL**: Selecione o domínio ou subdomínio onde o site ficará visível (ex: `https://teonanacatl.com.br` ou `https://banda.teonanacatl.com.br`).
   - **Application startup file**: Defina como **`app.js`** (Nosso arquivo de entrada na raiz).
5. Clique em **"Create"** (Criar).

---

### Passo 3: Executar a Instalação de Dependências e Start

1. Após a criação, o cPanel mostrará os detalhes do aplicativo.
2. Na seção **"NPM Packages"** ou utilizando o botão **"Run NPM Install"**, execute a instalação das dependências do arquivo `package.json`.
3. Adicione quaisquer variáveis de ambiente necessárias em **"Environment variables"**:
   - `NODE_ENV` = `production`
   - `PORT` = (Será atribuída automaticamente pelo Phusion Passenger da GoDaddy, mas você pode definir explicitamente se necessário).
4. Clique em **"Save"** (Salvar).
5. Clique em **"Restart"** (Reiniciar) para iniciar o servidor.

---

## 🛠️ Arquitetura e Estrutura Criada para GoDaddy

Para viabilizar este deploy suave, preparamos duas peças essenciais no seu projeto:
1. **`app.js` (Raiz)**: O arquivo que o cPanel usará como inicializador (`startup file`). Ele simplesmente importa e executa o servidor empacotado e otimizado em `dist/server.cjs`.
2. **`dist/server.cjs`**: O servidor backend empacotado que inclui todo o roteamento de API para o cadastro de fãs (`cadastro.csv`), persistência de votos, e serve as faixas de áudio compactadas (`audio/*.mp3`) e imagens estáticas de forma ultra-veloz.
