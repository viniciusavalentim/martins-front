import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

// Configurar a instância do Axios
export const api = axios.create({
    baseURL: 'https://localhost:7071/api',
});

interface RefreshTokenResponse {
    accessToken: string;
}

api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('@martins:accessToken');
        if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            try {
                const refreshToken = localStorage.getItem('@martins:accessToken');
                if (!refreshToken) throw new Error('No refresh token available');

                const { data } = await axios.post<RefreshTokenResponse>(
                    `${api.defaults.baseURL}/auth/refresh`,
                    { refreshToken }
                );

                api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                localStorage.setItem('accessToken', data.accessToken);

                if (error.config) {
                    if (error.config.headers) {
                        error.config.headers.set('Authorization', `Bearer ${data.accessToken}`);
                    }
                    return api.request(error.config as AxiosRequestConfig);
                }
            } catch (refreshError) {
                localStorage.removeItem('@martins:accessToken');
                localStorage.removeItem('@martins:refreshToken');

                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
