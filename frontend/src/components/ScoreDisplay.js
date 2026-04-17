import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
function getScoreMeta(value) {
    if (value === null) {
        return {
            tone: 'text-gray-900',
            label: 'Pending',
            helper: 'Adjust your profile to generate a live estimate.',
        };
    }
    if (value >= 750) {
        return {
            tone: 'text-emerald-500',
            label: 'Excellent',
            helper: 'Strong repayment profile with high approval potential.',
        };
    }
    if (value >= 650) {
        return {
            tone: 'text-blue-500',
            label: 'Good',
            helper: 'Healthy credit standing with room to optimize.',
        };
    }
    if (value >= 550) {
        return {
            tone: 'text-amber-500',
            label: 'Average',
            helper: 'The profile is workable, but risk factors are visible.',
        };
    }
    return {
        tone: 'text-red-500',
        label: 'Poor',
        helper: 'Higher-risk behavior is pulling the score down.',
    };
}
export default function ScoreDisplay({ score, loading, error, approvalColor }) {
    const meta = getScoreMeta(score?.credit_score ?? null);
    return (_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.18em] text-gray-500", children: "Score Overview" }), _jsx("div", { className: "mt-2 text-sm text-gray-500", children: "Real-time credit intelligence" })] }), _jsx("div", { className: "text-right", children: _jsx("div", { className: [
                                'inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold',
                                approvalColor,
                            ].join(' '), children: score ? score.approval_status : '—' }) })] }), _jsxs("div", { className: "mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, scale: 0.96, y: 8 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.98 }, transition: { duration: 0.25 }, className: ['text-7xl font-semibold tracking-tight tabular-nums', meta.tone].join(' '), children: score ? score.credit_score : '—' }, score?.credit_score ?? 'empty') }), _jsxs("div", { className: "mt-3 flex items-center gap-3", children: [_jsx("div", { className: "text-xl font-semibold text-gray-950", children: meta.label }), _jsx("div", { className: "rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500", children: "Range 300-900" })] }), _jsx("div", { className: "mt-3 max-w-xl text-sm text-gray-500", children: loading ? 'Updating your score from the latest controls…' : meta.helper })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 md:min-w-[240px]", children: [_jsxs("div", { className: "rounded-2xl border border-gray-200 bg-gray-50 p-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "Score band" }), _jsx("div", { className: "mt-2 text-lg font-semibold text-gray-950", children: meta.label })] }), _jsxs("div", { className: "rounded-2xl border border-gray-200 bg-gray-50 p-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.14em] text-gray-500", children: "Status" }), _jsx("div", { className: "mt-2 text-lg font-semibold text-gray-950", children: loading ? 'Refreshing' : score?.approval_status ?? 'Waiting' })] })] })] }), error ? _jsx("div", { className: "mt-5 text-sm text-red-500", children: error }) : null] }));
}
