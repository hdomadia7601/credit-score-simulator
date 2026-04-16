export const calculateScore = async (data: any) => {
    const res = await fetch("http://127.0.0.1:8000/api/calculate-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!res.ok) {
      throw new Error("Failed to calculate score");
    }
  
    return res.json();
  };