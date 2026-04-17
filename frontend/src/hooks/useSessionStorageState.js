import { useEffect, useState } from 'react';
function readValue(key, fallback) {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw)
            return fallback;
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
export function useSessionStorageState(key, initialValue) {
    const [state, setState] = useState(() => {
        if (typeof window === 'undefined')
            return initialValue;
        return readValue(key, initialValue);
    });
    useEffect(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(state));
        }
        catch {
            // Ignore write errors (e.g. storage disabled).
        }
    }, [key, state]);
    return [state, setState];
}
