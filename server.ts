import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // Support dynamic CORS with credentials so HTML5 audio media player inside the iframe can securely read the assets
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && origin !== "null") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else if (req.headers.referer) {
      try {
        const refUrl = new URL(req.headers.referer);
        if (refUrl.origin && refUrl.origin !== "null") {
          res.setHeader("Access-Control-Allow-Origin", refUrl.origin);
          res.setHeader("Access-Control-Allow-Credentials", "true");
        } else {
          res.setHeader("Access-Control-Allow-Origin", "*");
        }
      } catch (e) {
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Range");
    res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Ensure 'Nanos' directory exists at the root
  const nanosDir = path.join(process.cwd(), "Nanos");
  if (!fs.existsSync(nanosDir)) {
    fs.mkdirSync(nanosDir, { recursive: true });
  }

  // Safe timezone timestamp helper to prevent container RangeError for 'America/Sao_Paulo'
  function getTimestamp() {
    try {
      return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    } catch (e) {
      try {
        return new Date().toLocaleString("pt-BR");
      } catch (e2) {
        return new Date().toISOString();
      }
    }
  }

  // ==========================================
  // SMTP EMAIL TRANSPORTER LAZY INITIALIZATION
  // ==========================================
  let transporter: nodemailer.Transporter | null = null;

  function getMailTransporter() {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.warn("SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not fully configured. Email sending will be simulated.");
      return null;
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    return transporter;
  }

  // Simplified fan registration (Saves to local JSON database, sends CSV email attachment)
  app.post("/api/fans/register", async (req, res) => {
    try {
      const { name, email, phone, instagram, tiktok, age, country, state, city, favoriteTrack, message } = req.body;
      
      if (!name || !email || !country || !state || !city || !age) {
        return res.status(400).json({ error: "Nome, Email, Idade, País, Estado e Cidade são obrigatórios." });
      }

      const timestamp = getTimestamp();

      // Save to local JSON database file in Nanos folder
      const fansDbPath = path.join(process.cwd(), "Nanos", "fans_db.json");
      let fansList = [];
      if (fs.existsSync(fansDbPath)) {
        try {
          const rawData = fs.readFileSync(fansDbPath, "utf-8");
          fansList = JSON.parse(rawData);
        } catch (e) {
          console.error("Erro ao ler banco de dados de fãs local:", e);
          fansList = [];
        }
      }
      
      const newFan = {
        id: Date.now().toString() + "-" + Math.random().toString(36).substring(2, 7),
        timestamp,
        name,
        email,
        phone: phone || "",
        instagram: instagram || "",
        tiktok: tiktok || "",
        age,
        country,
        state,
        city,
        favoriteTrack: favoriteTrack || "",
        message: message || ""
      };
      
      fansList.push(newFan);
      fs.writeFileSync(fansDbPath, JSON.stringify(fansList, null, 2), "utf-8");

      // Try to append directly to Google Sheets if configured
      const sheetsConfigPath = path.join(process.cwd(), "Nanos", "sheets_config.json");
      if (fs.existsSync(sheetsConfigPath)) {
        try {
          const configRaw = fs.readFileSync(sheetsConfigPath, "utf-8");
          const config = JSON.parse(configRaw);
          if (config.spreadsheetId && config.accessToken) {
            console.log(`[GOOGLE SHEETS] Tentando inserir fã na planilha "${config.spreadsheetId}" em tempo real...`);
            const range = "Fãs!A:L";
            const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
            
            const formattedPhone = phone ? (String(phone).startsWith("'") ? String(phone) : `'${phone}`) : "";

            const row = [
              timestamp,
              name,
              email,
              formattedPhone,
              instagram || "",
              tiktok || "",
              String(age),
              country,
              state,
              city,
              favoriteTrack || "",
              message || ""
            ];

            const sheetsResponse = await fetch(sheetsUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.accessToken}`,
              },
              body: JSON.stringify({
                range,
                majorDimension: "ROWS",
                values: [row],
              }),
            });

            if (sheetsResponse.ok) {
              console.log(`[GOOGLE SHEETS] Cadastro de fã ${name} inserido com sucesso na planilha.`);
            } else {
              const errData = await sheetsResponse.json().catch(() => ({}));
              console.warn(`[GOOGLE SHEETS WARNING] Falha ao sincronizar em tempo real:`, errData);
            }
          }
        } catch (sheetsError) {
          console.error("[GOOGLE SHEETS ERROR] Erro ao sincronizar fã na planilha:", sheetsError);
        }
      }

      // Create CSV Attachment
      const sanitize = (val: string | number) => `"${(String(val || "")).replace(/"/g, '""')}"`;
      const csvHeader = `"Data/Hora","Nome","Email","Celular","Instagram","TikTok","Idade","País","Estado","Cidade","Música Favorita","Mensagem"\n`;
      const csvLine = `${sanitize(timestamp)},${sanitize(name)},${sanitize(email)},${sanitize(phone || "")},${sanitize(instagram || "")},${sanitize(tiktok || "")},${sanitize(age)},${sanitize(country)},${sanitize(state)},${sanitize(city)},${sanitize(favoriteTrack || "")},${sanitize(message || "")}\n`;
      const csvContent = "\ufeff" + csvHeader + csvLine;

      console.log(`[NOVO CADASTRO] Nome: ${name}, Email: ${email}, Idade: ${age}, TikTok: ${tiktok}, País: ${country}, Estado: ${state}, Cidade: ${city}, Música: ${favoriteTrack}`);

      // Setup email payload for the band
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Teonanacatl 94 Clã" <no-reply@teonanacatl94.com>',
        to: 'teonanacatl1994@gmail.com',
        subject: `Novo Cadastro de Fã: ${name}`,
        text: `Olá!\n\nUm novo fã se cadastrou no site oficial da banda Teonanacatl 94:\n\n` +
              `- Nome: ${name}\n` +
              `- Email: ${email}\n` +
              `- Idade: ${age} anos\n` +
              `- Celular/WhatsApp: ${phone || "Não informado"}\n` +
              `- Instagram: ${instagram || "Não informado"}\n` +
              `- TikTok: ${tiktok || "Não informado"}\n` +
              `- País: ${country}\n` +
              `- Estado: ${state}\n` +
              `- Cidade: ${city}\n` +
              `- Música Favorita: ${favoriteTrack || "Não informada"}\n` +
              `- Mensagem: ${message || "Nenhuma mensagem enviada."}\n\n` +
              `As informações detalhadas também foram anexadas a este e-mail em formato CSV.\n\n` +
              `Abraços,\nSite Teonanacatl 94`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-top: 0;">Novo Cadastro de Fã!</h2>
            <p>Um novo fã acaba de se cadastrar no site oficial da banda <strong>Teonanacatl 94</strong>:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px; border-bottom: 1px solid #f0f0f0;">Nome:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Email:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Idade:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${age} anos</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Celular/WhatsApp:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${phone || "Não informado"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Instagram:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${instagram || "Não informado"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">TikTok:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${tiktok || "Não informado"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">País:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${country}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Estado:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${state}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Cidade:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${city}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Música Favorita:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #10b981; font-weight: bold;">${favoriteTrack || "Não informada"}</td>
              </tr>
            </table>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
              <strong style="display: block; margin-bottom: 5px;">Mensagem:</strong>
              <p style="margin: 0; white-space: pre-wrap; font-style: italic;">${message || "Nenhuma mensagem enviada."}</p>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 10px;">
              Este e-mail foi gerado automaticamente pelo formulário de cadastro do site Teonanacatl 94. As informações estão em anexo no arquivo <strong>cadastro_fa.csv</strong>.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: 'cadastro_fa.csv',
            content: csvContent,
            contentType: 'text/csv',
          }
        ]
      };

      // Setup thank you email to the fan with embedded logo and social media links
      const thankYouMailOptions = {
        from: process.env.EMAIL_FROM || '"Teonanacatl 94" <no-reply@teonanacatl94.com>',
        to: email,
        subject: `Bem-vindo ao Clã, ${name}! 🤘`,
        text: `Olá, ${name}!\n\n` +
              `Agradecemos muito por se cadastrar no site oficial da banda Teonanacatl 94 e entrar para o nosso Clã!\n\n` +
              `Recebemos suas informações e sua mensagem. É uma honra ter você conosco vibrando na mesma frequência.\n\n` +
              `Sua música favorita selecionada: ${favoriteTrack || "Não informada"}\n\n` +
              `Acesse nosso site: https://www.teonanacatl94.com.br\n` +
              `Siga-nos no Instagram: https://www.instagram.com/teonanacatl94/\n` +
              `Siga-nos no YouTube: https://www.youtube.com/@Teonanacatl94\n\n` +
              `Abraços,\nBanda Teonanacatl 94`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #1f1f22; border-radius: 12px; background-color: #0c0c0e; color: #f4f4f5; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #1f1f22; padding-bottom: 20px;">
              <div style="margin-bottom: 10px;">
                <img src="cid:logo" alt="Teonanacatl 94 Logo" style="max-width: 180px; height: auto;" />
              </div>
              <h1 style="color: #10b981; font-size: 22px; margin: 10px 0 5px 0; font-family: 'Courier New', Courier, monospace; letter-spacing: 3px; font-weight: bold;">TEONANACATL 94</h1>
              <p style="color: #a1a1aa; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 1.5px;">O Clã dos Cyber-Fãs</p>
            </div>
            <div style="padding: 10px 5px;">
              <p style="color: #ffffff; font-size: 16px; margin-bottom: 15px;">Olá, <strong>${name}</strong>!</p>
              <p style="color: #d4d4d8; line-height: 1.6; font-size: 14px;">É uma honra dar as boas-vindas a você no nosso círculo oficial de apoiadores, o <strong>TeonanaClã</strong>!</p>
              <p style="color: #d4d4d8; line-height: 1.6; font-size: 14px;">Sua mensagem e seus dados de cadastro foram entregues diretamente à banda. Agradecemos muito por compartilhar seu apoio conosco.</p>
              
              <div style="background-color: #18181b; padding: 15px; border-left: 4px solid #10b981; margin: 25px 0; border-radius: 6px; border: 1px solid #27272a;">
                <span style="color: #a1a1aa; font-size: 11px; display: block; margin-bottom: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">Sua Música Favorita:</span>
                <strong style="color: #10b981; font-size: 16px; font-family: 'Courier New', Courier, monospace;">${favoriteTrack || "Não informada"}</strong>
              </div>
              
              <p style="color: #d4d4d8; line-height: 1.6; font-size: 14px;">Prepare-se para receber atualizações exclusivas sobre novos lançamentos digitais, fita cassete, remasters de 2026 e as próximas apresentações na estrada.</p>
              
              <div style="margin-top: 35px; border-top: 1px solid #1f1f22; padding-top: 20px; text-align: center;">
                <p style="font-size: 13px; color: #a1a1aa; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Conecte-se Conosco:</p>
                <div style="margin: 15px 0;">
                  <a href="https://www.teonanacatl94.com.br" target="_blank" style="display: inline-block; padding: 8px 16px; margin: 5px; background-color: #18181b; color: #10b981; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold; border: 1px solid #10b981;">
                    🌐 SITE OFICIAL
                  </a>
                  <a href="https://www.instagram.com/teonanacatl94/" target="_blank" style="display: inline-block; padding: 8px 16px; margin: 5px; background-color: #18181b; color: #ec4899; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold; border: 1px solid #ec4899;">
                    📸 INSTAGRAM
                  </a>
                  <a href="https://www.youtube.com/@Teonanacatl94" target="_blank" style="display: inline-block; padding: 8px 16px; margin: 5px; background-color: #18181b; color: #ef4444; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold; border: 1px solid #ef4444;">
                    📺 YOUTUBE
                  </a>
                </div>
              </div>

              <p style="margin-top: 30px; border-top: 1px solid #1f1f22; padding-top: 15px; font-size: 13px; color: #a1a1aa; line-height: 1.5; text-align: center;">
                Continue escutando o álbum e vibrando nas frequências analógicas!<br><br>
                <strong>Banda Teonanacatl 94</strong>
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: 'Teonanacatl 94 Logo.png',
            path: path.join(process.cwd(), 'Teonanacatl 94 Logo.png'),
            cid: 'logo'
          }
        ]
      };

      const mailTransporter = getMailTransporter();
      if (mailTransporter) {
        // Send email to the band
        await mailTransporter.sendMail(mailOptions);
        console.log(`[EMAIL ENVIADO] Cadastro enviado para teonanacatl1994@gmail.com`);

        // Send thank you email to the fan
        try {
          await mailTransporter.sendMail(thankYouMailOptions);
          console.log(`[EMAIL ENVIADO] Email de agradecimento enviado para o fã: ${email}`);
        } catch (thankYouErr) {
          console.error("Erro ao enviar email de agradecimento para o fã:", thankYouErr);
          // Don't fail the whole request if only the thank you email fails
        }
      } else {
        console.log(`[EMAIL SIMULADO] Email da banda não enviado porque SMTP não está configurado. Opções de envio:`, mailOptions);
        console.log(`[EMAIL SIMULADO] Email de agradecimento ao fã não enviado porque SMTP não está configurado. Opções de envio:`, thankYouMailOptions);
      }

      res.json({ success: true, message: "Cadastro enviado com sucesso!" });
    } catch (err: any) {
      console.error("Erro ao processar e enviar cadastro:", err);
      res.status(500).json({ error: err.message || "Erro interno ao processar cadastro." });
    }
  });

  // Get all registered fans
  app.get("/api/fans", (req, res) => {
    try {
      const fansDbPath = path.join(process.cwd(), "Nanos", "fans_db.json");
      let fansList = [];
      if (fs.existsSync(fansDbPath)) {
        const rawData = fs.readFileSync(fansDbPath, "utf-8");
        fansList = JSON.parse(rawData);
      }
      res.json({ success: true, fans: fansList });
    } catch (err: any) {
      console.error("Erro ao listar fãs:", err);
      res.status(500).json({ error: err.message || "Erro interno ao listar fãs." });
    }
  });

  // Delete a registered fan from local database
  app.delete("/api/fans/:id", (req, res) => {
    try {
      const { id } = req.params;
      const fansDbPath = path.join(process.cwd(), "Nanos", "fans_db.json");
      let fansList = [];
      if (fs.existsSync(fansDbPath)) {
        const rawData = fs.readFileSync(fansDbPath, "utf-8");
        fansList = JSON.parse(rawData);
      }
      const filteredFans = fansList.filter((f: any) => f.id !== id);
      fs.writeFileSync(fansDbPath, JSON.stringify(filteredFans, null, 2), "utf-8");
      res.json({ success: true, message: "Cadastro excluído com sucesso." });
    } catch (err: any) {
      console.error("Erro ao excluir fã:", err);
      res.status(500).json({ error: err.message || "Erro interno ao excluir fã." });
    }
  });

  // Save Google Sheets config (For real-time sync on new registrations)
  app.post("/api/admin/sheets-config", (req, res) => {
    try {
      const { spreadsheetId, accessToken, spreadsheetName, spreadsheetUrl } = req.body;
      const sheetsConfigPath = path.join(process.cwd(), "Nanos", "sheets_config.json");
      
      let config: any = {};
      if (fs.existsSync(sheetsConfigPath)) {
        try {
          config = JSON.parse(fs.readFileSync(sheetsConfigPath, "utf-8"));
        } catch (e) {
          config = {};
        }
      }

      config = {
        ...config,
        spreadsheetId: spreadsheetId || config.spreadsheetId,
        accessToken: accessToken || config.accessToken,
        spreadsheetName: spreadsheetName || config.spreadsheetName,
        spreadsheetUrl: spreadsheetUrl || config.spreadsheetUrl,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(sheetsConfigPath, JSON.stringify(config, null, 2), "utf-8");
      res.json({ success: true, message: "Configuração do Google Sheets atualizada no servidor com sucesso." });
    } catch (err: any) {
      console.error("Erro ao salvar configuração do Google Sheets no servidor:", err);
      res.status(500).json({ error: err.message || "Erro ao salvar configuração no servidor." });
    }
  });

  // Get stored Google Sheets config
  app.get("/api/admin/sheets-config", (req, res) => {
    try {
      const sheetsConfigPath = path.join(process.cwd(), "Nanos", "sheets_config.json");
      if (fs.existsSync(sheetsConfigPath)) {
        const config = JSON.parse(fs.readFileSync(sheetsConfigPath, "utf-8"));
        // Provide whether it is set
        res.json({
          success: true,
          config: {
            spreadsheetId: config.spreadsheetId,
            spreadsheetName: config.spreadsheetName,
            spreadsheetUrl: config.spreadsheetUrl,
            hasToken: !!config.accessToken,
            updatedAt: config.updatedAt
          }
        });
      } else {
        res.json({ success: true, config: null });
      }
    } catch (err: any) {
      console.error("Erro ao ler configuração do Google Sheets do servidor:", err);
      res.status(500).json({ error: err.message || "Erro ao ler configuração do servidor." });
    }
  });

  // Direct endpoint to download the GoDaddy deployment ZIP file
  app.get("/deploy_godaddy.zip", (req, res) => {
    try {
      const zipPath = path.join(process.cwd(), "deploy_godaddy.zip");
      if (fs.existsSync(zipPath)) {
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", "attachment; filename=deploy_godaddy.zip");
        const fileStream = fs.createReadStream(zipPath);
        fileStream.pipe(res);
      } else {
        res.status(404).send("Arquivo deploy_godaddy.zip não encontrado na raiz do projeto. Por favor, solicite a geração do build novamente.");
      }
    } catch (err: any) {
      console.error("Erro ao fazer download do deploy_godaddy.zip:", err);
      res.status(500).send("Erro interno ao servir o arquivo ZIP.");
    }
  });

  // API endpoint for safe proxy-friendly audio streaming
  app.get("/api/audio/:filename", (req, res) => {
    try {
      const filename = req.params.filename;
      const safeFilename = path.basename(filename);
      const filePath = path.join(process.cwd(), "audio", safeFilename);
      
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        res.sendFile(filePath);
      } else {
        res.status(404).json({ error: "Arquivo de áudio não encontrado." });
      }
    } catch (err: any) {
      console.error("Erro ao servir áudio pela API:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static audio files for both dev and prod
  const audioPath = path.join(process.cwd(), "audio");
  if (fs.existsSync(audioPath)) {
    app.use("/audio", express.static(audioPath));
  }

  // Serve root level images securely for both dev and prod
  app.use((req, res, next) => {
    try {
      const decodedPath = decodeURIComponent(req.path);
      const ext = path.extname(decodedPath).toLowerCase();
      console.log(`[DEBUG_STATIC_IMAGES] req.path: "${req.path}", decodedPath: "${decodedPath}", ext: "${ext}"`);
      if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
        const safePath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, "");
        const cleanPath = safePath.startsWith("/") ? safePath.slice(1) : safePath;
        const filePath = path.join(process.cwd(), cleanPath);
        console.log(`[DEBUG_STATIC_IMAGES] filePath: "${filePath}", exists: ${fs.existsSync(filePath)}`);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          return res.sendFile(filePath);
        }
      }
    } catch (err: any) {
      console.error("[DEBUG_STATIC_IMAGES] Error:", err);
    }
    next();
  });

  // Vite middleware for development or fallback to production static serving
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(process.cwd(), "dist"));

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
