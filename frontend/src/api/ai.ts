const API_URL = import.meta.env.VITE_API_URL;

export const getExplanation = async (data: any) => {
  try {
    const res = await fetch(`${API_URL}/api/get-explanation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch AI explanation: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API Error (getExplanation):", error);
    throw error;
  }
};