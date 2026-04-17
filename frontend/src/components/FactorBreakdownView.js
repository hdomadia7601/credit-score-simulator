import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
function formatValue(v) {
    const sign = v >= 0 ? '+' : '';
    return `${sign}${Math.round(v)}`;
}
export default function FactorBreakdownView({ breakdown }) {
    const items = [
        { key: 'payment_history', label: 'Payment history', hint: 'Missed payments have the biggest impact.' },
        { key: 'utilization', label: 'Credit utilization', hint: 'Higher utilization typically lowers the score.' },
        { key: 'credit_age', label: 'Credit history length', hint: 'Longer history improves stability.' },
        { key: 'credit_mix', label: 'Credit mix', hint: 'A stronger mix can help slightly.' },
        { key: 'inquiries', label: 'Credit inquiries + loans', hint: 'Too many new lines can reduce score.' },
    ];
    return (_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.18em] text-gray-500", children: "Factor Breakdown" }), _jsx("div", { className: "mt-2 text-lg font-semibold text-gray-950", children: "Why the score moved" }), _jsx("div", { className: "mt-1 text-sm text-gray-500", children: "Each driver contributes positive or negative pressure to the model." }), _jsx("div", { className: "mt-6 space-y-4", children: items.map((it) => {
                    const v = breakdown ? breakdown[it.key] : null;
                    const pos = v !== null && v >= 0;
                    const width = v === null ? 12 : Math.max(12, Math.min(100, Math.abs(v) / 1.6));
                    return (_jsxs(motion.div, { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 }, className: "rounded-2xl border border-gray-200 bg-gray-50 p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-gray-950", children: it.label }), _jsx("div", { className: "mt-1 text-xs text-gray-500", children: it.hint })] }), _jsx("div", { className: [
                                            'text-sm font-semibold tabular-nums',
                                            pos ? 'text-emerald-600' : 'text-red-500',
                                        ].join(' '), children: v === null ? '—' : formatValue(v) })] }), _jsx("div", { className: "mt-4 h-2 rounded-full bg-white", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${width}%` }, transition: { duration: 0.45, ease: 'easeOut' }, className: [
                                        'h-2 rounded-full',
                                        pos ? 'bg-emerald-500' : 'bg-red-500',
                                    ].join(' ') }) })] }, it.key));
                }) })] }));
}
