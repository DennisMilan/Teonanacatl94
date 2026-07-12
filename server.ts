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

  // Simplified fan registration (No Database, sends CSV email attachment)
  app.post("/api/fans/register", async (req, res) => {
    try {
      const { name, email, phone, instagram, country, state, city, favoriteTrack, message } = req.body;
      
      if (!name || !email || !country || !state || !city) {
        return res.status(400).json({ error: "Nome, Email, País, Estado e Cidade são obrigatórios." });
      }

      const timestamp = getTimestamp();

      // Create CSV Attachment
      const sanitize = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;
      const csvHeader = `"Data/Hora","Nome","Email","Celular","Instagram","País","Estado","Cidade","Música Favorita","Mensagem"\n`;
      const csvLine = `${sanitize(timestamp)},${sanitize(name)},${sanitize(email)},${sanitize(phone || "")},${sanitize(instagram || "")},${sanitize(country)},${sanitize(state)},${sanitize(city)},${sanitize(favoriteTrack || "")},${sanitize(message || "")}\n`;
      const csvContent = "\ufeff" + csvHeader + csvLine;

      console.log(`[NOVO CADASTRO] Nome: ${name}, Email: ${email}, País: ${country}, Estado: ${state}, Cidade: ${city}, Música: ${favoriteTrack}`);

      // Setup email payload for the band
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Teonanacatl 94 Clã" <no-reply@teonanacatl94.com>',
        to: 'teonanacatl1994@gmail.com',
        subject: `Novo Cadastro de Fã: ${name}`,
        text: `Olá!\n\nUm novo fã se cadastrou no site oficial da banda Teonanacatl 94:\n\n` +
              `- Nome: ${name}\n` +
              `- Email: ${email}\n` +
              `- Celular/WhatsApp: ${phone || "Não informado"}\n` +
              `- Instagram: ${instagram || "Não informado"}\n` +
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
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Celular/WhatsApp:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${phone || "Não informado"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Instagram:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${instagram || "Não informado"}</td>
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

      // Setup thank you email to the fan
      const thankYouMailOptions = {
        from: process.env.EMAIL_FROM || '"Teonanacatl 94" <no-reply@teonanacatl94.com>',
        to: email,
        subject: `Bem-vindo ao Clã, ${name}! 🤘`,
        text: `Olá, ${name}!\n\n` +
              `Agradecemos muito por se cadastrar no site oficial da banda Teonanacatl 94 e entrar para o nosso Clã!\n\n` +
              `Recebemos suas informações e sua mensagem. É uma honra ter você conosco vibrando na mesma frequência.\n\n` +
              `Sua música favorita selecionada: ${favoriteTrack || "Não informada"}\n\n` +
              `Fique ligado em nosso site para novidades, datas de shows e lançamentos futuros!\n\n` +
              `Abraços,\nBanda Teonanacatl 94`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #0c0c0e; color: #f4f4f5;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #10b981; font-size: 24px; margin-bottom: 5px; font-family: sans-serif; letter-spacing: 2px;">TEONANACATL 94</h1>
              <p style="color: #a1a1aa; font-size: 14px; margin: 0;">O Clã dos Cyber-Fãs</p>
            </div>
            <div style="border-top: 1px solid #27272a; padding-top: 20px;">
              <p style="color: #ffffff;">Olá, <strong>${name}</strong>!</p>
              <p style="color: #d4d4d8; line-height: 1.6;">É uma honra dar as boas-vindas a você no nosso círculo oficial de apoiadores, o <strong>TeonanaClã</strong>!</p>
              <p style="color: #d4d4d8; line-height: 1.6;">Sua mensagem e seus dados de cadastro foram entregues diretamente à banda. Agradecemos muito por compartilhar seu apoio conosco.</p>
              <div style="background-color: #18181b; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
                <span style="color: #a1a1aa; font-size: 12px; display: block; margin-bottom: 5px; font-weight: bold; text-transform: uppercase;">Sua Música Favorita:</span>
                <strong style="color: #ffffff; font-size: 15px;">${favoriteTrack || "Não informada"}</strong>
              </div>
              <p style="color: #d4d4d8; line-height: 1.6;">Prepare-se para receber atualizações exclusivas sobre novos lançamentos digitais, fita cassete, remasters de 2026 e as próximas apresentações na estrada.</p>
              <p style="margin-top: 30px; border-top: 1px solid #27272a; padding-top: 15px; font-size: 13px; color: #a1a1aa; line-height: 1.5;">
                Siga as nossas redes e continue escutando o álbum!<br><br>
                <strong>Banda Teonanacatl 94</strong>
              </p>
            </div>
          </div>
        `
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
