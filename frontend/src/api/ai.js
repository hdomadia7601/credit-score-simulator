export const getExplanation = async (data) => {
    const res = await fetch("http://127.0.0.1:8000/api/get-explanation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error("Failed to fetch AI explanation");
    }
    return res.json();
};
