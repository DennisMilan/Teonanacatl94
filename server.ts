import express from "express";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // Ensure 'Nanos' directory exists at the root
  const nanosDir = path.join(process.cwd(), "Nanos");
  if (!fs.existsSync(nanosDir)) {
    fs.mkdirSync(nanosDir, { recursive: true });
  }

  const cadastroFile = path.join(nanosDir, "cadastro.csv");

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

  // Initial votes starting from 0 for all 16 tracks, ensuring pure data from cadastro.csv
  const defaultVotes: Record<string, number> = {
    "Dentro de Mim": 0,
    "Solitude": 0,
    "Como Poderei Sonhar": 0,
    "Mundo": 0,
    "Meu Vazio": 0,
    "Esperança": 0,
    "Máscara": 0,
    "Minha Vida": 0,
    "O Último Tolteca": 0,
    "Sombras de um Caminho": 0,
    "Bright Eyes": 0,
    "Dia Após o Outro": 0,
    "Outra Face do Dia": 0,
    "Rochas": 0,
    "Será Que Eu Errei": 0,
    "Cinema Imaginário (Bonus Track)": 0,
  };

  function getCalculatedVotes() {
    const votes = { ...defaultVotes };

    if (fs.existsSync(cadastroFile)) {
      try {
        const fileContent = fs.readFileSync(cadastroFile, "utf-8");
        const lines = fileContent.split("\n").filter(line => line.trim() !== "");
        if (lines.length > 1) {
          const parseCSVLine = (text: string) => {
            const result = [];
            let cur = "";
            let inQuotes = false;
            for (let i = 0; i < text.length; i++) {
              const char = text[i];
              if (char === '"') {
                if (inQuotes && text[i + 1] === '"') {
                  cur += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                result.push(cur);
                cur = "";
              } else {
                cur += char;
              }
            }
            result.push(cur);
            return result;
          };

          for (let i = 1; i < lines.length; i++) {
            const parts = parseCSVLine(lines[i]);
            const favoriteTrack = parts[6]; // Musica_Favorita is column 7 (index 6)
            if (favoriteTrack && favoriteTrack.trim() !== "") {
              const trackName = favoriteTrack.trim();
              let normalizedTrack = trackName;
              if (trackName === "Cinema Imaginário") {
                normalizedTrack = "Cinema Imaginário (Bonus Track)";
              }
              votes[normalizedTrack] = (votes[normalizedTrack] || 0) + 1;
            }
          }
        }
      } catch (err) {
        console.error("Error calculating votes from CSV:", err);
      }
    }
    return votes;
  }

  // API Routes
  app.get("/api/fans/results", (req, res) => {
    try {
      const votes = getCalculatedVotes();
      res.json({ success: true, votes });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/fans/register", (req, res) => {
    try {
      const { name, email, phone, instagram, city, favoriteTrack } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: "Nome e Email são obrigatórios." });
      }

      // Ensure file has header
      const csvHeader = `"Data/Hora","Nome","Email","Celular","Instagram","Cidade","Musica_Favorita"\n`;
      if (!fs.existsSync(cadastroFile)) {
        fs.writeFileSync(cadastroFile, csvHeader, "utf-8");
      }

      const timestamp = getTimestamp();
      const sanitize = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;
      
      const csvLine = `${sanitize(timestamp)},${sanitize(name)},${sanitize(email)},${sanitize(phone)},${sanitize(instagram)},${sanitize(city)},${sanitize(favoriteTrack)}\n`;
      
      fs.appendFileSync(cadastroFile, csvLine, "utf-8");
      console.log(`Fã registrado com sucesso no cadastro.csv: ${name} (${email})`);
      
      res.json({ success: true });
    } catch (err: any) {
      console.error("Erro ao registrar fã:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/fans/list", (req, res) => {
    try {
      if (!fs.existsSync(cadastroFile)) {
        return res.json({ success: true, fans: [] });
      }
      const fileContent = fs.readFileSync(cadastroFile, "utf-8");
      const lines = fileContent.split("\n").filter(line => line.trim() !== "");
      if (lines.length <= 1) {
        return res.json({ success: true, fans: [] });
      }
      
      const parseCSVLine = (text: string) => {
        const result = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(cur);
            cur = "";
          } else {
            cur += char;
          }
        }
        result.push(cur);
        return result;
      };

      const fans = lines.slice(1).map(line => {
        const parts = parseCSVLine(line);
        return {
          timestamp: parts[0] || "",
          name: parts[1] || "",
          email: parts[2] || "",
          phone: parts[3] || "",
          instagram: parts[4] || "",
          city: parts[5] || "",
          favoriteTrack: parts[6] || ""
        };
      });

      res.json({ success: true, fans });
    } catch (err: any) {
      console.error("Erro ao listar fãs:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/fans/download", (req, res) => {
    try {
      if (fs.existsSync(cadastroFile)) {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=cadastro.csv");
        const fileStream = fs.createReadStream(cadastroFile);
        fileStream.pipe(res);
      } else {
        res.status(404).json({ error: "Arquivo de cadastro não encontrado." });
      }
    } catch (err: any) {
      console.error("Erro ao baixar cadastro.csv:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/fans/vote", (req, res) => {
    try {
      const { trackTitle } = req.body;
      if (!trackTitle) {
        return res.status(400).json({ error: "Faixa é obrigatória para votação." });
      }

      // Ensure file has header
      const csvHeader = `"Data/Hora","Nome","Email","Celular","Instagram","Cidade","Musica_Favorita"\n`;
      if (!fs.existsSync(cadastroFile)) {
        fs.writeFileSync(cadastroFile, csvHeader, "utf-8");
      }

      const timestamp = getTimestamp();
      const sanitize = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;
      
      const csvLine = `${sanitize(timestamp)},${sanitize("Anônimo (Voto Direto)")},${sanitize("voto_direto@teonanacatl94.com")},${sanitize("")},${sanitize("")},${sanitize("")},${sanitize(trackTitle)}\n`;
      fs.appendFileSync(cadastroFile, csvLine, "utf-8");

      console.log(`Voto direto computado no cadastro.csv para a faixa: ${trackTitle}`);

      const votes = getCalculatedVotes();
      res.json({ success: true, votes });
    } catch (err: any) {
      console.error("Erro ao computar voto:", err);
      res.status(500).json({ error: err.message });
    }
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

    // Serve static audio files in production
    const audioPath = path.join(process.cwd(), "audio");
    if (fs.existsSync(audioPath)) {
      app.use("/audio", express.static(audioPath));
    }

    // Serve root level images (png/jpg) in production
    app.use(express.static(process.cwd(), {
      index: false,
      extensions: ["png", "jpg", "jpeg"]
    }));

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
