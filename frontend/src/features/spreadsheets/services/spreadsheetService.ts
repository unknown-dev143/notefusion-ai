import { api, handleApiError } from '../../../lib/api';

export interface Spreadsheet {
    id: number;
    title: string;
    data: string; // JSON string of grid data
    created_at: string;
    updated_at: string;
}

export interface SpreadsheetCreate {
    title: string;
    data: string;
}

export interface SpreadsheetUpdate {
    title?: string;
    data?: string;
}

export const spreadsheetService = {
    async getSpreadsheets(): Promise<Spreadsheet[]> {
        try {
            const response = await api.get<Spreadsheet[]>('/spreadsheets');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch spreadsheets');
        }
    },

    async createSpreadsheet(data: SpreadsheetCreate): Promise<Spreadsheet> {
        try {
            const response = await api.post<Spreadsheet>('/spreadsheets', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to create spreadsheet');
        }
    },

    async updateSpreadsheet(id: number, data: SpreadsheetUpdate): Promise<Spreadsheet> {
        try {
            const response = await api.patch<Spreadsheet>(`/spreadsheets/${id}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to update spreadsheet');
        }
    },

    async deleteSpreadsheet(id: number): Promise<void> {
        try {
            await api.delete(`/spreadsheets/${id}`);
        } catch (error) {
            throw handleApiError(error, 'Failed to delete spreadsheet');
        }
    }
};
