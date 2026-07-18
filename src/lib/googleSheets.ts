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

// Get or create a folder in Google Drive with strong spelling tolerance and global searching fallback
export const getOrCreateFolder = async (accessToken: string, folderName: string, parentId?: string): Promise<string> => {
  try {
    const cleanTargetName = folderName.toLowerCase().trim();
    
    // We will build a smart query based on the target folder name to look for any close variations
    let q = `mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (cleanTargetName.includes('teo') || cleanTargetName.includes('teon')) {
      q += ` and (name contains 'teo' or name contains 'Teo' or name contains 'Teon')`;
    } else if (cleanTargetName.includes('cadast')) {
      q += ` and (name contains 'cadast' or name contains 'Cadast' or name contains 'cadastro')`;
    } else {
      q += ` and name contains '${folderName.replace(/'/g, "\\'")}'`;
    }

    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,parents)&spaces=drive&pageSize=100`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const files = searchData.files || [];
      console.log(`[Google Drive] Encontradas ${files.length} pastas na busca flexível para "${folderName}"`);

      // 1. Try to find an exact case-insensitive match with the specified parent
      const exactMatchWithParent = files.find((f: any) => {
        const name = f.name.toLowerCase().trim();
        const parentMatches = !parentId || (f.parents && f.parents.includes(parentId));
        return name === cleanTargetName && parentMatches;
      });
      if (exactMatchWithParent) {
        console.log(`[Google Drive] Pasta existente exata com pai encontrada: "${exactMatchWithParent.name}" com ID: ${exactMatchWithParent.id}`);
        return exactMatchWithParent.id;
      }

      // 2. Try to find a spelling-tolerant match with the specified parent
      const spellingMatchWithParent = files.find((f: any) => {
        const name = f.name.toLowerCase().trim();
        const parentMatches = !parentId || (f.parents && f.parents.includes(parentId));
        if (!parentMatches) return false;

        if (cleanTargetName.includes('teo') || cleanTargetName.includes('teon')) {
          return name.includes('teo') || name.includes('catl') || name.includes('teon');
        }
        if (cleanTargetName.includes('cadast')) {
          return name.includes('cadast') || name.includes('cadastro');
        }
        return name.includes(cleanTargetName);
      });
      if (spellingMatchWithParent) {
        console.log(`[Google Drive] Pasta existente por aproximação e pai encontrada: "${spellingMatchWithParent.name}" com ID: ${spellingMatchWithParent.id}`);
        return spellingMatchWithParent.id;
      }

      // 3. Try to find an exact case-insensitive match globally (ignoring parent)
      const exactMatchGlobal = files.find((f: any) => {
        const name = f.name.toLowerCase().trim();
        return name === cleanTargetName;
      });
      if (exactMatchGlobal) {
        console.log(`[Google Drive] Pasta existente exata global encontrada: "${exactMatchGlobal.name}" com ID: ${exactMatchGlobal.id}`);
        if (parentId && (!exactMatchGlobal.parents || !exactMatchGlobal.parents.includes(parentId))) {
          await moveFileToFolder(accessToken, exactMatchGlobal.id, parentId);
        }
        return exactMatchGlobal.id;
      }

      // 4. Try to find any spelling-tolerant match globally (ignoring parent)
      const spellingMatchGlobal = files.find((f: any) => {
        const name = f.name.toLowerCase().trim();
        if (cleanTargetName.includes('teo') || cleanTargetName.includes('teon')) {
          return name.includes('teo') || name.includes('catl') || name.includes('teon') || name.includes('banda');
        }
        if (cleanTargetName.includes('cadast')) {
          return name.includes('cadast') || name.includes('cadastro');
        }
        return name.includes(cleanTargetName);
      });
      if (spellingMatchGlobal) {
        console.log(`[Google Drive] Pasta existente global por aproximação encontrada: "${spellingMatchGlobal.name}" com ID: ${spellingMatchGlobal.id}`);
        if (parentId && (!spellingMatchGlobal.parents || !spellingMatchGlobal.parents.includes(parentId))) {
          await moveFileToFolder(accessToken, spellingMatchGlobal.id, parentId);
        }
        return spellingMatchGlobal.id;
      }
    }
  } catch (err) {
    console.warn(`Erro ao buscar pasta "${folderName}" na busca flexível:`, err);
  }

  // Folder not found or query failed, create it
  console.log(`[Google Drive] Nenhuma pasta correspondente encontrada. Criando nova pasta "${folderName}"...`);
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const body: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    body.parents = [parentId];
  } else {
    body.parents = ['root'];
  }

  const response = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Falha ao criar pasta "${folderName}" no Google Drive.`);
  }

  const data = await response.json();
  return data.id;
};

// Move a file to a new parent folder
export const moveFileToFolder = async (accessToken: string, fileId: string, folderId: string): Promise<void> => {
  try {
    // 1. Get current parents of the file
    const fileUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`;
    const response = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) return;
    const data = await response.json();
    const currentParents = data.parents || [];
    
    // 2. Add to new folder and remove from old parents
    const addParents = folderId;
    const removeParents = currentParents.join(',');
    
    const updateUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${encodeURIComponent(addParents)}&removeParents=${encodeURIComponent(removeParents)}`;
    await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (err) {
    console.warn(`Erro ao mover arquivo ${fileId} para a pasta ${folderId}:`, err);
  }
};

// Search for a spreadsheet by name or create it if not found, with strong folder/spelling reuse
export const getOrCreateSpreadsheet = async (accessToken: string, name: string): Promise<SpreadsheetInfo> => {
  try {
    // 1. Ensure folder structure: Teonanacatl -> Cadastro
    const teonanacatlFolderId = await getOrCreateFolder(accessToken, 'Teonanacatl');
    const cadastroFolderId = await getOrCreateFolder(accessToken, 'Cadastro', teonanacatlFolderId);

    const cleanName = name.toLowerCase().trim();

    // 2. Search for existing spreadsheet in Google Drive safely
    const q = `mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink,parents)&pageSize=100`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const files = searchData.files || [];
      console.log(`[Google Drive] Encontradas ${files.length} planilhas no total para buscar.`);

      // Step 2a: Try to find an exact matching spreadsheet inside the target folder
      const exactMatchInFolder = files.find((f: any) => {
        const fName = f.name.toLowerCase().trim();
        const isInFolder = f.parents && f.parents.includes(cadastroFolderId);
        return fName === cleanName && isInFolder;
      });
      if (exactMatchInFolder) {
        console.log(`[Google Drive] Planilha exata encontrada na pasta Cadastro: "${exactMatchInFolder.name}"`);
        return {
          id: exactMatchInFolder.id,
          name: exactMatchInFolder.name,
          url: exactMatchInFolder.webViewLink || `https://docs.google.com/spreadsheets/d/${exactMatchInFolder.id}/edit`,
        };
      }

      // Step 2b: Try to find ANY spreadsheet inside the target folder (since this folder is dedicated to Cadastro, any sheet in it is correct)
      const anySpreadsheetInFolder = files.find((f: any) => {
        const isInFolder = f.parents && f.parents.includes(cadastroFolderId);
        return isInFolder;
      });
      if (anySpreadsheetInFolder) {
        console.log(`[Google Drive] Nenhuma planilha exata, mas encontramos outra planilha na pasta Cadastro. Usando: "${anySpreadsheetInFolder.name}"`);
        return {
          id: anySpreadsheetInFolder.id,
          name: anySpreadsheetInFolder.name,
          url: anySpreadsheetInFolder.webViewLink || `https://docs.google.com/spreadsheets/d/${anySpreadsheetInFolder.id}/edit`,
        };
      }

      // Step 2c: Try to find a matching spreadsheet globally (case-insensitive exact or spelling-tolerant)
      const globalMatch = files.find((f: any) => {
        const fName = f.name.toLowerCase().trim();
        return fName === cleanName || fName.includes('cadastro') || fName.includes('teonanacatl');
      });
      if (globalMatch) {
        console.log(`[Google Drive] Planilha encontrada globalmente: "${globalMatch.name}". Movendo para pasta Cadastro.`);
        await moveFileToFolder(accessToken, globalMatch.id, cadastroFolderId);
        return {
          id: globalMatch.id,
          name: globalMatch.name,
          url: globalMatch.webViewLink || `https://docs.google.com/spreadsheets/d/${globalMatch.id}/edit`,
        };
      }
    }

    // 3. Create a new spreadsheet inside the Cadastro folder since it was not found anywhere
    console.log(`[Google Drive] Nenhuma planilha existente encontrada. Criando nova planilha "${name}"...`);
    const createUrl = 'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink';
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: name,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [cadastroFolderId],
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Falha ao criar planilha Google Sheets "${name}".`);
    }

    const createdData = await createResponse.json();
    const spreadsheetId = createdData.id;
    const spreadsheetUrl = createdData.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // Write headers to the new spreadsheet
    await writeHeaderRow(accessToken, spreadsheetId);

    return {
      id: spreadsheetId,
      name: name,
      url: spreadsheetUrl,
    };
  } catch (err: any) {
    console.error('Erro no getOrCreateSpreadsheet com pastas:', err);
    throw err;
  }
};

// Helper function to dynamically resolve the exact case-insensitive and tilde-insensitive tab name of the "Fãs" sheet
export const getExactFansTabName = async (accessToken: string, spreadsheetId: string): Promise<string> => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(title)`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      const sheets = data.sheets || [];
      const found = sheets.find((s: any) => {
        const title = (s.properties?.title || '').toLowerCase().trim();
        return title === 'fãs' || title === 'fas';
      });
      if (found) {
        return found.properties.title;
      }
      // Fallback to the first tab of the spreadsheet if no explicit "Fãs" sheet is found
      if (sheets.length > 0 && sheets[0]?.properties?.title) {
        console.log(`[getExactFansTabName] Nenhuma aba "Fãs" encontrada. Usando a primeira aba da planilha: "${sheets[0].properties.title}"`);
        return sheets[0].properties.title;
      }
    }
  } catch (err) {
    console.warn('[getExactFansTabName] Erro ao buscar abas da planilha:', err);
  }
  return 'Fãs'; // default fallback
};

// Check and ensure the headers exist on the target tab of the spreadsheet
export const ensureHeadersOnTab = async (accessToken: string, spreadsheetId: string, tabName: string): Promise<void> => {
  try {
    const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A1:B1`;
    const response = await fetch(checkUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      const values = data.values || [];
      // If the row is empty or first cell is falsy, write the header row
      if (values.length === 0 || !values[0] || values[0].length === 0 || !values[0][0]) {
        console.log(`[ensureHeadersOnTab] Planilha vazia ou sem cabeçalhos na aba "${tabName}". Inicializando cabeçalhos...`);
        const range = `${tabName}!A1:L1`;
        const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
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
        await fetch(writeUrl, {
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
      }
    }
  } catch (err) {
    console.warn('[ensureHeadersOnTab] Falha ao verificar/garantir cabeçalhos na planilha:', err);
  }
};

// Write Header Row to the Fãs sheet
const writeHeaderRow = async (accessToken: string, spreadsheetId: string): Promise<void> => {
  const fansTabName = await getExactFansTabName(accessToken, spreadsheetId);
  const range = `${fansTabName}!A1:L1`;
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
  const fansTabName = await getExactFansTabName(accessToken, spreadsheetId);
  await ensureHeadersOnTab(accessToken, spreadsheetId, fansTabName);
  
  const range = `${fansTabName}!A:L`;
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

  const fansTabName = await getExactFansTabName(accessToken, spreadsheetId);
  await ensureHeadersOnTab(accessToken, spreadsheetId, fansTabName);

  const range = `${fansTabName}!A:L`;
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
  const fansTabName = await getExactFansTabName(accessToken, spreadsheetId);
  await ensureHeadersOnTab(accessToken, spreadsheetId, fansTabName);

  const range = `${fansTabName}!A2:L2000`; // Skipping header row
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
