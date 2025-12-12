import { useState, useCallback } from 'react';
import { message } from 'antd';
import { exportImportService, ExportOptions, ImportResult } from '../services/exportImportService';
import { Note } from '../../../types/note';
import type { UploadFile } from 'antd/es/upload/interface';

export const useExportImport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportNote = useCallback(async (note: Note, options: ExportOptions) => {
    try {
      setIsExporting(true);
      setProgress(0);
      
      const blob = await exportImportService.exportNote(note, options);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.replace(/[^\w\d]/g, '_')}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setProgress(100);
      message.success('Export completed successfully');
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export note');
      return false;
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const exportMultiple = useCallback(async (notes: Note[], format: 'zip' | 'json' = 'zip') => {
    try {
      setIsExporting(true);
      setProgress(0);
      
      const blob = await exportImportService.bulkExport(notes, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setProgress(100);
      message.success(`Exported ${notes.length} notes successfully`);
      return true;
    } catch (error) {
      console.error('Bulk export failed:', error);
      message.error('Failed to export notes');
      return false;
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const importNotes = useCallback(async (
    files: FileList | File[] | UploadFile[] | null,
    userId: string
  ): Promise<ImportResult | null> => {
    if (!files || (Array.isArray(files) && files.length === 0) || ('length' in (files as any) && (files as any).length === 0)) return null;
    if (!userId) {
      message.error('User ID is required for importing notes');
      return null;
    }
    
    try {
      setIsImporting(true);
      setProgress(0);
      
      let fileArray: File[] = [];
      if (files instanceof FileList) {
        fileArray = Array.from(files);
      } else if (Array.isArray(files)) {
        // Could be File[] or UploadFile[]
        const maybeUploadFiles = files as UploadFile<any>[];
        const first = maybeUploadFiles[0] as UploadFile<any> | undefined;
        if (
          first &&
          typeof first === 'object' &&
          Object.prototype.hasOwnProperty.call(first, 'originFileObj')
        ) {
          fileArray = maybeUploadFiles
            .map((f) => (f as UploadFile<any>).originFileObj as File | undefined)
            .filter((f): f is File => f !== undefined);
        } else {
          fileArray = files as File[];
        }
      }

      const result = await exportImportService.importNotes(fileArray, userId);
      
      setProgress(100);
      
      if (result.success) {
        message.success(`Successfully imported ${result.importedCount} notes`);
      } else {
        message.warning(
          `Imported ${result.importedCount} notes with ${result.errors.length} errors`
        );
      }
      
      return result;
    } catch (error) {
      console.error('Import failed:', error);
      message.error('Failed to import notes');
      return null;
    } finally {
      setIsImporting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  return {
    isExporting,
    isImporting,
    progress,
    exportNote,
    exportMultiple,
    importNotes,
  };
};
