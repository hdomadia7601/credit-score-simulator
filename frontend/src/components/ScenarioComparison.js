import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
function approvalColor(status) {
    if (!status)
        return 'border-gray-200 bg-white text-gray-700';
    if (status === 'High Approval')
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (status === 'Moderate Approval')
        return 'border-blue-200 bg-blue-50 text-blue-700';
    return 'border-red-200 bg-red-50 text-red-700';
}
function formatDelta(v) {
    const sign = v >= 0 ? '+' : '';
    return `${sign}${Math.round(v)}`;
}
function FactorDeltas({ deltas }) {
    const items = [
        { key: 'payment_history', label: 'Payment history' },
        { key: 'utilization', label: 'Utilization' },
        { key: 'credit_age', label: 'Credit age' },
        { key: 'credit_mix', label: 'Credit mix' },
        { key: 'inquiries', label: 'Inquiries + loans' },
    ];
    return (_jsx("div", { className: "mt-4 grid grid-cols-1 md:grid-cols-2 gap-3", children: items.map((it) => {
            const v = deltas[it.key];
            const improved = v >= 0;
            return (_jsxs("div", { className: [
                    'rounded-lg border p-3',
                    improved ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-gray-200 bg-gray-50 text-gray-800',
                ].join(' '), children: [_jsx("div", { className: "text-sm font-medium", children: it.label }), _jsx("div", { className: "text-xs text-gray-600 mt-1", children: "Impact on score" }), _jsx("div", { className: "text-lg font-semibold tabular-nums mt-2", children: formatDelta(v) })] }, it.key));
        }) }));
}
export default function ScenarioComparison({ current, inputs, onCompare }) {
    const [targetUtilization, setTargetUtilization] = useState(inputs.credit_utilization_pct);
    const [targetMissed, setTargetMissed] = useState(inputs.missed_payments_last_12_months);
    const [targetInquiries, setTargetInquiries] = useState(inputs.recent_credit_inquiries);
    const [targetMix, setTargetMix] = useState(inputs.credit_mix);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const isImprovementLikely = useMemo(() => {
        // Heuristic: only show an "improvement" hint when the scenario tightens the two biggest drivers.
        return (targetUtilization < inputs.credit_utilization_pct ||
            targetMissed < inputs.missed_payments_last_12_months ||
            targetInquiries <= inputs.recent_credit_inquiries);
    }, [inputs, targetInquiries, targetMissed, targetUtilization]);
    // Keep scenario controls in sync when user changes base inputs.
    useEffect(() => {
        setTargetUtilization(inputs.credit_utilization_pct);
        setTargetMissed(inputs.missed_payments_last_12_months);
        setTargetInquiries(inputs.recent_credit_inquiries);
        setTargetMix(inputs.credit_mix);
        setResult(null);
    }, [inputs]);
    async function compare() {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                current_inputs: inputs,
                scenario_inputs: {
                    credit_utilization_pct: targetUtilization,
                    missed_payments_last_12_months: targetMissed,
                    recent_credit_inquiries: targetInquiries,
                    credit_mix: targetMix,
                },
            };
            const res = await onCompare(payload);
            setResult(res);
        }
        catch {
            setError('Could not compare scenarios right now.');
        }
        finally {
            setLoading(false);
        }
    }
    const delta = result?.delta_score ?? 0;
    return (_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.18em] text-gray-500", children: "Scenario Simulator" }), _jsx("div", { className: "mt-2 text-lg font-semibold text-gray-950", children: "Run a what-if improvement path" }), _jsx("div", { className: "mt-1 text-sm text-gray-500", children: "Compare current score against a cleaner behavior profile." })] }), _jsx("div", { className: "text-right text-xs font-medium text-gray-500", children: isImprovementLikely ? 'Likely improves score' : 'Adjust targets to see change' })] }), _jsxs("div", { className: "mt-6 space-y-4", children: [_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-gray-50 p-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "Target utilization" }), _jsxs("div", { className: "mt-2 text-lg font-semibold tabular-nums text-gray-950", children: [targetUtilization, "%"] }), _jsx("input", { className: "fintech-slider mt-4 w-full accent-black", type: "range", min: 0, max: 100, step: 1, value: targetUtilization, onChange: (e) => setTargetUtilization(Number(e.target.value)) })] }), _jsxs("div", { className: "rounded-2xl border border-gray-200 bg-gray-50 p-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "Target missed payments" }), _jsxs("div", { className: "mt-2 text-lg font-semibold tabular-nums text-gray-950", children: [targetMissed, " missed"] }), _jsx("input", { className: "fintech-slider mt-4 w-full accent-black", type: "range", min: 0, max: 12, step: 1, value: targetMissed, onChange: (e) => setTargetMissed(Number(e.target.value)) })] }), _jsxs("div", { className: "rounded-2xl border border-gray-200 bg-gray-50 p-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "Target inquiries" }), _jsxs("div", { className: "mt-2 text-lg font-semibold tabular-nums text-gray-950", children: [targetInquiries, " inquiries"] }), _jsx("input", { className: "fintech-slider mt-4 w-full accent-black", type: "range", min: 0, max: 12, step: 1, value: targetInquiries, onChange: (e) => setTargetInquiries(Number(e.target.value)) })] }), _jsxs("div", { className: "rounded-2xl border border-gray-200 bg-gray-50 p-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "Target credit mix" }), _jsx("div", { className: "mt-2 text-lg font-semibold text-gray-950 capitalize", children: targetMix }), _jsx("div", { className: "mt-3 grid grid-cols-3 gap-2", children: ['good', 'average', 'poor'].map((m) => (_jsx("button", { type: "button", onClick: () => setTargetMix(m), className: [
                                        'rounded-2xl border px-3 py-3 text-left text-sm font-medium capitalize transition',
                                        targetMix === m
                                            ? 'border-gray-900 bg-gray-950 text-white'
                                            : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
                                    ].join(' '), children: m }, m))) })] })] }), _jsx("div", { className: "mt-5", children: _jsx("button", { type: "button", disabled: !current || loading, onClick: compare, className: [
                        'w-full rounded-2xl px-4 py-3 text-sm font-medium transition',
                        !current || loading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-950 text-white hover:opacity-90',
                    ].join(' '), children: loading ? 'Running simulation…' : 'Run Simulation' }) }), error ? _jsx("div", { className: "mt-3 text-sm text-red-500", children: error }) : null, _jsx(AnimatePresence, { children: result ? (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, className: "mt-5", children: [_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-gray-50 p-5", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "Simulation result" }), _jsxs("div", { className: [
                                        'mt-3 text-5xl font-semibold tracking-tight tabular-nums',
                                        result.delta_score >= 0 ? 'text-emerald-500' : 'text-red-500',
                                    ].join(' '), children: [delta >= 0 ? '+' : '', delta] }), _jsx("div", { className: "mt-1 text-sm text-gray-500", children: "Projected score delta" }), _jsxs("div", { className: "mt-5 grid grid-cols-1 gap-3 md:grid-cols-2", children: [_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "Before" }), _jsx("div", { className: "mt-2 text-3xl font-semibold tabular-nums text-gray-950", children: result.current.credit_score }), _jsx("div", { className: `mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs ${approvalColor(result.current.approval_status)}`, children: result.current.approval_status })] }), _jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "After" }), _jsx("div", { className: "mt-2 text-3xl font-semibold tabular-nums text-gray-950", children: result.improved.credit_score }), _jsx("div", { className: `mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs ${approvalColor(result.improved.approval_status)}`, children: result.improved.approval_status })] })] }), _jsx("div", { className: "mt-5 rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700", children: result.scenario_explanation })] }), _jsx(FactorDeltas, { deltas: result.factor_deltas })] }, "scenario-result")) : null })] }));
}
