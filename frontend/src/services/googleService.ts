// Google Drive service
export const googleDriveService = {
  // Upload file to Google Drive
  async uploadFile(file: File, fileName: string): Promise<string> {
    if (!window.gapi || !window.gapi.client) {
      throw new Error('Google API not initialized');
    }

    const fileMetadata = {
      name: fileName,
      mimeType: file.type
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await window.gapi.client.drive.files.create({
      resource: fileMetadata,
      media: {
        mimeType: file.type,
        body: file
      },
      fields: 'id, name, webViewLink, webContentLink'
    });

    return response.result.webViewLink || response.result.id;
  },

  // List files from Google Drive
  async listFiles(): Promise<any[]> {
    if (!window.gapi || !window.gapi.client) {
      throw new Error('Google API not initialized');
    }

    const response = await window.gapi.client.drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
      q: "mimeType='image/png' or mimeType='image/jpeg' or mimeType='application/pdf'"
    });

    return response.result.files || [];
  },

  // Download file from Google Drive
  async downloadFile(fileId: string): Promise<Blob> {
    if (!window.gapi || !window.gapi.client) {
      throw new Error('Google API not initialized');
    }

    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    return response.body;
  },

  // Delete file from Google Drive
  async deleteFile(fileId: string) {
    if (!window.gapi || !window.gapi.client) {
      throw new Error('Google API not initialized');
    }

    await window.gapi.client.drive.files.delete({
      fileId: fileId
    });
  }
};

// Google Docs service
export const googleDocsService = {
  // Create a new Google Doc
  async createDocument(title: string, content: string): Promise<string> {
    if (!window.gapi || !window.gapi.client) {
      throw new Error('Google API not initialized');
    }

    const response = await window.gapi.client.docs.documents.create({
      title: title
    });

    const documentId = response.result.documentId;

    // Insert content
    await window.gapi.client.docs.documents.batchUpdate({
      documentId: documentId,
      requests: [{
        insertText: {
          location: {
            index: 1
          },
          text: content
        }
      }]
    });

    return documentId;
  }
};

