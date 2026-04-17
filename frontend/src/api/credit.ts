const API_URL = import.meta.env.VITE_API_URL;

export const calculateScore = async (data: any) => {
  try {
    const res = await fetch(`${API_URL}/api/calculate-score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Failed to calculate score: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API Error (calculateScore):", error);
    throw error;
  }
};