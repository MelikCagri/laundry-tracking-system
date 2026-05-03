const API_URL = 'http://localhost:5000/api';

// Helper to handle fetch responses
const fetcher = async (url: string, options?: RequestInit) => {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// --- Users ---
export const identifyUser = async (phone: string) => {
  return fetcher('/users/identify', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
};

export const getUserQueues = async (userId: string) => {
  return fetcher(`/users/${userId}/queues`);
};

// --- Machines ---
export const getAllMachines = async () => {
  return fetcher('/machines');
};

export const startMachine = async (id: string, userId: string, durationMinutes: number, userNote?: string) => {
  return fetcher(`/machines/${id}/start`, {
    method: 'POST',
    body: JSON.stringify({ userId, durationMinutes, userNote }),
  });
};

export const finishMachine = async (id: string) => {
  return fetcher(`/machines/${id}/finish`, {
    method: 'POST',
  });
};

export const clearMachine = async (id: string) => {
  return fetcher(`/machines/${id}/clear`, {
    method: 'POST',
  });
};

export const extendMachine = async (id: string, extraMinutes: number) => {
  return fetcher(`/machines/${id}/extend`, {
    method: 'POST',
    body: JSON.stringify({ extraMinutes }),
  });
};

export const reportMachine = async (id: string, userId: string) => {
  return fetcher(`/machines/${id}/report`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
};

export const getOwnerWhatsApp = async (id: string) => {
  return fetcher(`/machines/${id}/owner-whatsapp`);
};

// --- Queue ---
export const joinQueue = async (id: string, userId: string) => {
  return fetcher(`/machines/${id}/queue/join`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
};

export const leaveQueue = async (id: string, userId: string) => {
  return fetcher(`/machines/${id}/queue/leave`, {
    method: 'DELETE',
    body: JSON.stringify({ userId }),
  });
};

export const getQueueInfo = async (id: string) => {
  return fetcher(`/machines/${id}/queue`);
};
