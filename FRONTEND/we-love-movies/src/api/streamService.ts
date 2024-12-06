import { api } from './axiosConfig';
import { StreamParams } from '../types/interfaces';

interface StreamUrlResponse {
    url: string;
}

export const streamService = {
    getPlayerUrl: async (params: StreamParams): Promise<string> => {
        const response = await api.get<StreamUrlResponse>('/stream/', {
            params
        });
        return response.data.url
    }
    

}