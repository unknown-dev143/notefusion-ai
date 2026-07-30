import { api, handleApiError } from '../../../lib/api';


export interface MindMap {
    id: number;
    title: string;
    data: string; // JSON string of nodes/edges
    created_at: string;
    updated_at: string;
}

export interface MindMapCreate {
    title: string;
    data: string;
}

export interface MindMapUpdate {
    title?: string;
    data?: string;
}

export const mindMapService = {
    async getMindMaps(): Promise<MindMap[]> {
        try {
            const response = await api.get<MindMap[]>('/mindmaps');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch mindmaps');
        }
    },

    async createMindMap(data: MindMapCreate): Promise<MindMap> {
        try {
            const response = await api.post<MindMap>('/mindmaps', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to create mindmap');
        }
    },

    async updateMindMap(id: number, data: MindMapUpdate): Promise<MindMap> {
        try {
            const response = await api.patch<MindMap>(`/mindmaps/${id}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to update mindmap');
        }
    },

    async deleteMindMap(id: number): Promise<void> {
        try {
            await api.delete(`/mindmaps/${id}`);
        } catch (error) {
            throw handleApiError(error, 'Failed to delete mindmap');
        }
    }
};
