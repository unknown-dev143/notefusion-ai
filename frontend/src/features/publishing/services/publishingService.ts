import { api, handleApiError } from '../../../lib/api';

export interface PublishedSite {
    id: number;
    title: string;
    url: string;
    views: number;
    note_id?: number | null;
    created_at: string;
}

export interface PublishedSiteCreate {
    title: string;
    url: string;
    note_id?: number;
}

export interface PublishedSiteUpdate {
    title?: string;
    url?: string;
    views?: number;
}

export const publishingService = {
    async getSites(): Promise<PublishedSite[]> {
        try {
            const response = await api.get<PublishedSite[]>('/publishing');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch published sites');
        }
    },

    async createSite(data: PublishedSiteCreate): Promise<PublishedSite> {
        try {
            const response = await api.post<PublishedSite>('/publishing', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to create site');
        }
    },

    async deleteSite(id: number): Promise<void> {
        try {
            await api.delete(`/publishing/${id}`);
        } catch (error) {
            throw handleApiError(error, 'Failed to delete site');
        }
    },

    async updateSite(id: number, data: PublishedSiteUpdate): Promise<PublishedSite> {
        try {
            const response = await api.patch<PublishedSite>(`/publishing/${id}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to update site');
        }
    },

    async getPublicSite(slug: string): Promise<{ site: PublishedSite, note: any }> {
        try {
            const response = await api.get<{site: PublishedSite, note: any}>(`/publishing/public/${slug}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch public site resolving slug: ' + slug);
        }
    }
};
