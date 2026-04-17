import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
function makeId() {
    return Math.random().toString(16).slice(2);
}
export default function ChatAssistant({ disabled, inputs, score, onAsk }) {
    void inputs;
    const [messages, setMessages] = useState([
        {
            id: makeId(),
            role: 'assistant',
            text: 'Ask a question like “How can I improve my score fastest?” and I’ll tailor it to your inputs.',
        },
    ]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const scrollerRef = useRef(null);
    const quickQuestions = useMemo(() => [
        'How can I improve my score fastest?',
        'What happens if I reduce utilization?',
        'Which factor is hurting me most?',
    ], []);
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el)
            return;
        el.scrollTop = el.scrollHeight;
    }, [messages, loading]);
    async function send(question) {
        const q = question.trim();
        if (!q)
            return;
        if (!score)
            return;
        setError(null);
        setLoading(true);
        const userMsg = { id: makeId(), role: 'user', text: q };
        setMessages((m) => [...m, userMsg]);
        try {
            // ✅ BUILD HISTORY FROM CHAT
            const history = messages.map((m) => ({
                role: m.role,
                content: m.text,
            }));
            const res = await onAsk({
                question: q,
                history,
            });
            const assistantMsg = {
                id: makeId(),
                role: 'assistant',
                text: res.assistant_response,
            };
            setMessages((m) => [...m, assistantMsg]);
            setDraft('');
        }
        catch {
            setError('Could not reach the explanation service.');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.18em] text-gray-500", children: "Chat Assistant" }), _jsx("div", { className: "mt-2 text-lg font-semibold text-gray-950", children: "Ask follow-up questions" }), _jsx("div", { className: "mt-1 text-sm text-gray-500", children: "ChatGPT-lite guidance grounded in the current score state." })] }), _jsx("div", { className: "text-right text-xs font-medium text-gray-500", children: score ? `Score ${score.credit_score}` : 'Compute score' })] }), _jsx("div", { className: "mt-5", children: _jsx("div", { className: "flex flex-wrap gap-2", children: quickQuestions.map((q) => (_jsx("button", { type: "button", disabled: disabled || loading || !score, onClick: () => send(q), className: [
                            'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                            disabled || loading || !score
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                        ].join(' '), children: q }, q))) }) }), _jsxs("div", { className: "mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50", children: [_jsxs("div", { ref: scrollerRef, className: "max-h-[420px] overflow-auto p-4", children: [_jsx(AnimatePresence, { initial: false, children: messages.map((m) => (_jsx(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, className: m.role === 'user' ? 'my-2 flex justify-end' : 'my-2 flex justify-start', children: _jsx("div", { className: [
                                            'max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm',
                                            m.role === 'user'
                                                ? 'bg-gray-950 text-white'
                                                : 'border border-gray-200 bg-white text-gray-900',
                                        ].join(' '), children: m.text }) }, m.id))) }), loading && (_jsx("div", { className: "my-2 flex justify-start", children: _jsx("div", { className: "rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm", children: "Thinking..." }) }))] }), _jsxs("div", { className: "border-t border-gray-200 bg-white p-3", children: [error && _jsx("div", { className: "mb-2 text-xs text-red-500", children: error }), _jsxs("div", { className: "relative", children: [_jsx("input", { className: "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-24 text-sm outline-none transition focus:border-gray-900 focus:bg-white", placeholder: score ? 'Type your question…' : 'Compute a score to enable chat', value: draft, onChange: (e) => setDraft(e.target.value), disabled: disabled || loading || !score, onKeyDown: (e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                void send(draft);
                                            }
                                        } }), _jsx("button", { type: "button", disabled: disabled || loading || !score || !draft.trim(), onClick: () => send(draft), className: [
                                            'absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-4 py-2 text-sm font-medium transition',
                                            disabled || loading || !score || !draft.trim()
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-950 text-white hover:opacity-90',
                                        ].join(' '), children: loading ? '...' : 'Send' })] })] })] })] }));
}
