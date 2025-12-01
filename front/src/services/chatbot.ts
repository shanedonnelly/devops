const isDev = window.location.port === '5173';
const API_BASE_URL = isDev 
  ? 'http://localhost/devops/api' 
  : window.location.origin + '/devops/api';

export interface ChatRequest {
  query: string;
  state: null;
  site_id: string | null;
}

export interface ChatResponse {
  response: string;
}

export const chatbotApi = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};