import { api, handleApiError } from '../lib/api';

export interface Presentation {
    id: number;
    title: string;
    topic?: string;
    slides_data: any[];
    theme_id: string;
    created_at: string;
    updated_at: string;
}

export interface PresentationCreate {
    title: string;
    topic?: string;
    slides_data: any[];
    theme_id?: string;
}

export const presentationService = {
    async getPresentations(): Promise<Presentation[]> {
        try {
            const response = await api.get<Presentation[]>('/presentations');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch presentations');
        }
    },

    async getPresentation(id: number): Promise<Presentation> {
        try {
            const response = await api.get<Presentation>(`/presentations/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch presentation');
        }
    },

    async createPresentation(data: PresentationCreate): Promise<Presentation> {
        try {
            const response = await api.post<Presentation>('/presentations', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to save presentation');
        }
    },

    async updatePresentation(id: number, data: Partial<PresentationCreate>): Promise<Presentation> {
        try {
            const response = await api.patch<Presentation>(`/presentations/${id}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to update presentation');
        }
    },

    async deletePresentation(id: number): Promise<void> {
        try {
            await api.delete(`/presentations/${id}`);
        } catch (error) {
            throw handleApiError(error, 'Failed to delete presentation');
        }
    }
};
