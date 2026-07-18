// Google Sheets API Integration Helpers

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
}

export interface GoogleFanRow {
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  tiktok: string;
  age: string;
  country: string;
  state: string;
  city: string;
  favoriteTrack: string;
  message: string;
}

// Create a new spreadsheet named "Teonanacatl 94 - Cadastro de Fãs"
export const createTeonanacatlSheet = async (accessToken: string): Promise<SpreadsheetInfo> => {
  return getOrCreateSpreadsheet(accessToken, 'Teonanacatl 94 - Cadastro de Fãs');
};

// Search for a spreadsheet by name or create it if not found
export const getOrCreateSpreadsheet = async (accessToken: string, name: string): Promise<SpreadsheetInfo> => {
  try {
    // 1. Search for existing spreadsheet in Google Drive by name
    const query = `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const files = searchData.files || [];
      if (files.length > 0) {
        const file = files[0];
        return {
          id: file.id,
          name: file.name,
          url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
        };
      }
    }
  } catch (searchError) {
    console.warn('Erro ao pesquisar planilha no Drive:', searchError);
  }

  // 2. Create a new spreadsheet since it was not found
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      properties: {
        title: name,
      },
      sheets: [
        {
          properties: {
            title: 'Fãs',
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Falha ao criar planilha Google Sheets "${name}".`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write headers to the new spreadsheet
  await writeHeaderRow(accessToken, spreadsheetId);

  return {
    id: spreadsheetId,
    name: name,
    url: spreadsheetUrl,
  };
};

// Write Header Row to the Fãs sheet
const writeHeaderRow = async (accessToken: string, spreadsheetId: string): Promise<void> => {
  const range = 'Fãs!A1:L1';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;

  const headers = [
    'Data/Hora',
    'Nome',
    'E-mail',
    'Celular',
    'Instagram',
    'TikTok',
    'Idade',
    'País',
    'Estado',
    'Cidade',
    'Música Favorita',
    'Mensagem'
  ];

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [headers],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao configurar cabeçalhos da planilha.');
  }
};

// Append a single fan registration to the spreadsheet
export const appendFanToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  fan: GoogleFanRow
): Promise<void> => {
  const range = 'Fãs!A:L';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const formattedPhone = fan.phone ? (fan.phone.startsWith("'") ? fan.phone : `'${fan.phone}`) : '';

  const row = [
    fan.timestamp,
    fan.name,
    fan.email,
    formattedPhone,
    fan.instagram,
    fan.tiktok,
    fan.age,
    fan.country,
    fan.state,
    fan.city,
    fan.favoriteTrack,
    fan.message,
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [row],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao adicionar fã à planilha Google.');
  }
};

// Append bulk fans to the spreadsheet
export const appendBulkFansToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  fans: GoogleFanRow[]
): Promise<void> => {
  if (fans.length === 0) return;

  const range = 'Fãs!A:L';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const rows = fans.map((fan) => {
    const formattedPhone = fan.phone ? (fan.phone.startsWith("'") ? fan.phone : `'${fan.phone}`) : '';
    return [
      fan.timestamp,
      fan.name,
      fan.email,
      formattedPhone,
      fan.instagram,
      fan.tiktok,
      fan.age,
      fan.country,
      fan.state,
      fan.city,
      fan.favoriteTrack,
      fan.message,
    ];
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: rows,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao sincronizar lote de fãs na planilha.');
  }
};

// Read registered fans from the spreadsheet
export const fetchFansFromSheet = async (
  accessToken: string,
  spreadsheetId: string
): Promise<GoogleFanRow[]> => {
  const range = 'Fãs!A2:L2000'; // Skipping header row
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao carregar registros da planilha.');
  }

  const data = await response.json();
  const rows = data.values || [];

  return rows.map((row: any[]) => ({
    timestamp: row[0] || '',
    name: row[1] || '',
    email: row[2] || '',
    phone: row[3] || '',
    instagram: row[4] || '',
    tiktok: row[5] || '',
    age: row[6] || '',
    country: row[7] || '',
    state: row[8] || '',
    city: row[9] || '',
    favoriteTrack: row[10] || '',
    message: row[11] || '',
  }));
};

// Search for existing spreadsheets in Google Drive
export const searchSpreadsheetsInDrive = async (accessToken: string): Promise<SpreadsheetInfo[]> => {
  const url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'+and+trashed=false&fields=files(id,name,webViewLink)`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao buscar planilhas no Google Drive.');
  }

  const data = await response.json();
  const files = data.files || [];

  return files.map((file: any) => ({
    id: file.id,
    name: file.name,
    url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
  }));
};
