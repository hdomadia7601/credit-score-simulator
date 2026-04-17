// In development we proxy `/api` to FastAPI via Vite.
// In production (Vercel) set `VITE_API_BASE_URL` to your Render backend URL,
// e.g. "https://credit-score-backend.onrender.com".
const API_BASE = import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== ''
    ? import.meta.env.VITE_API_BASE_URL
    : '/api';
async function postJson(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
    }
    return (await res.json());
}
export function calculateScore(inputs) {
    return postJson('/calculate-score', inputs);
}
export function getExplanation(payload) {
    return postJson('/get-explanation', payload);
}
export function simulateScenario(payload) {
    return postJson('/simulate-scenario', payload);
}
