import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
export default function AIExplanation({ disabled, inputs, score, onExplain }) {
    void inputs;
    const [question, setQuestion] = useState('How can I improve my credit score fastest?');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [response, setResponse] = useState(null);
    const topNegatives = useMemo(() => response?.structured?.top_negative_factors ?? [], [response]);
    const suggestions = useMemo(() => response?.structured?.actionable_suggestions ?? [], [response]);
    useEffect(() => {
        let cancelled = false;
        if (disabled || !score) {
            setResponse(null);
            return;
        }
        const timer = window.setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await onExplain({ question: 'Summarize what is hurting my score and what I should do next.' });
                if (!cancelled)
                    setResponse(res);
            }
            catch {
                if (!cancelled)
                    setError('Could not refresh AI suggestions right now.');
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        }, 350);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [disabled, onExplain, score]);
    return (_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.18em] text-gray-500", children: "AI Advisor" }), _jsx("div", { className: "mt-2 text-lg font-semibold text-gray-950", children: "Personalized next best actions" }), _jsx("div", { className: "mt-1 text-sm text-gray-500", children: "Live guidance generated from the current credit profile." })] }), _jsx("div", { className: "text-right text-xs font-medium text-gray-500", children: score ? `Estimated score: ${score.credit_score}` : 'Compute a score first' })] }), _jsxs("div", { className: "mt-5", children: [_jsx("label", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "Ask for a deeper explanation" }), _jsx("textarea", { className: "mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:bg-white", rows: 3, value: question, onChange: (e) => setQuestion(e.target.value), disabled: disabled }), _jsxs("div", { className: "mt-3 flex items-center justify-between gap-3", children: [_jsx("button", { type: "button", className: [
                                    'rounded-2xl px-4 py-2.5 text-sm font-medium transition',
                                    disabled
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-950 text-white hover:opacity-90',
                                ].join(' '), onClick: async () => {
                                    setLoading(true);
                                    setError(null);
                                    try {
                                        const res = await onExplain({ question: question.trim() });
                                        setResponse(res);
                                    }
                                    catch {
                                        setError('Could not generate explanation right now.');
                                    }
                                    finally {
                                        setLoading(false);
                                    }
                                }, disabled: disabled || loading, children: loading ? 'Generating…' : 'Refresh insight' }), _jsx("div", { className: "text-xs text-gray-500", children: response ? 'Synced with current score.' : 'Advisor loads automatically.' })] }), error ? _jsx("div", { className: "mt-3 text-xs text-red-500", children: error }) : null] }), _jsx(AnimatePresence, { mode: "wait", children: response ? (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, className: "mt-5 space-y-4", children: [_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-gray-50 p-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "Summary" }), _jsx("div", { className: "mt-2 text-sm leading-6 text-gray-900 whitespace-pre-wrap", children: response.assistant_response })] }), topNegatives.length ? (_jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "What's hurting your score" }), _jsx("div", { className: "mt-2 space-y-2", children: topNegatives.map((t, idx) => (_jsx("div", { className: "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700", children: t }, idx))) })] })) : null, suggestions.length ? (_jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "What you should do" }), _jsx("div", { className: "mt-2 space-y-2", children: suggestions.map((s, idx) => (_jsx("div", { className: "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700", children: s }, idx))) })] })) : null] }, "ai-response")) : null })] }));
}
