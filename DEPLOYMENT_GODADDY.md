# Como Hospedar o Teonanacatl 94 no GoDaddy (Node.js cPanel)

Este guia prático explica o passo a passo para hospedar e rodar esta aplicação full-stack (React + Express) na Hospedagem GoDaddy compartilhada ou VPS que utiliza o painel **cPanel**.

---

## 📋 Pré-requisitos no cPanel da GoDaddy

Certifique-se de que seu plano de hospedagem GoDaddy possui suporte para **Node.js** (Geralmente disponível nos planos Web Hosting Plus ou VPS com cPanel / Seletor de Node.js).

---

## 🚀 Passo a Passo para Implantação

### Passo 1: Preparar os Arquivos para Upload
Você tem duas opções para subir a sua aplicação:

#### Opção A: Build Local (Recomendado - Mais rápido e evita consumo de CPU do servidor GoDaddy)
1. No seu computador, rode o comando para compilar o projeto:
   ```bash
   npm run build
   ```
2. Isso gerará as pastas e arquivos compilados:
   - `dist/` (Contém o frontend compilado e o servidor backend empacotado `dist/server.cjs`)
   - `audio/` (Contém as faixas de áudio otimizadas)
   - Arquivos estáticos de imagem na raiz (ex: `banda_para_youtube.png`, `Teonanacatl 94.jpg`, `Teonanacatl 1994 (ReCovered) - Final.png`)
3. Compacte os seguintes arquivos e pastas em um arquivo **`.zip`**:
   - `dist/`
   - `audio/`
   - `Nanos/` (Onde fica o arquivo de cadastro de fãs `cadastro.csv`, se já houver registros)
   - `app.js` (O arquivo de inicialização criado na raiz)
   - `package.json`
   - Arquivos `.png` e `.jpg` da raiz
4. Suba este arquivo `.zip` para o diretório da sua aplicação na GoDaddy (através do **Gerenciador de Arquivos** do cPanel ou por **FTP**).
5. Extraia o conteúdo na pasta destino (ex: `/home/usuario/teonanacatl-app`).

#### Opção B: Build diretamente no Servidor GoDaddy (Necessário acesso SSH)
1. Suba todo o código-fonte do projeto (exceto a pasta `node_modules`).
2. Conecte-se por SSH ao seu servidor GoDaddy.
3. Vá até a pasta do aplicativo e execute:
   ```bash
   npm install
   npm run build
   ```

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
