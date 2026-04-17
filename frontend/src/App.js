import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// ✅ API IMPORTS
import { calculateScore } from './api/credit';
import { getExplanation } from './api/ai';
import { simulateScenario } from './lib/api';
import { useSessionStorageState } from './hooks/useSessionStorageState';
import InputPanel from './components/InputPanel';
import ScoreDisplay from './components/ScoreDisplay';
import FactorBreakdownView from './components/FactorBreakdownView';
import AIExplanation from './components/AIExplanation';
import ChatAssistant from './components/ChatAssistant';
import ScenarioComparison from './components/ScenarioComparison';
const DEFAULT_INPUTS = {
    monthly_income: 8000,
    monthly_expenses: 5500,
    credit_utilization_pct: 45,
    missed_payments_last_12_months: 1,
    credit_history_length_years: 5,
    active_loans: 2,
    credit_mix: 'average',
    recent_credit_inquiries: 2,
};
export default function App() {
    const [inputs, setInputs] = useSessionStorageState('creditScoreSimulator.inputs', DEFAULT_INPUTS);
    const [lastScore, setLastScore] = useSessionStorageState('creditScoreSimulator.lastScore', null);
    const [score, setScore] = useState(lastScore);
    const [loadingScore, setLoadingScore] = useState(false);
    const [scoreError, setScoreError] = useState(null);
    // -----------------------------
    // SCORING (BACKEND CONNECTED)
    // -----------------------------
    useEffect(() => {
        let cancelled = false;
        const t = window.setTimeout(async () => {
            setLoadingScore(true);
            setScoreError(null);
            try {
                const res = await calculateScore(inputs);
                if (!cancelled) {
                    setScore(res);
                    setLastScore(res);
                }
            }
            catch {
                if (!cancelled)
                    setScoreError('Unable to calculate score right now.');
            }
            if (!cancelled)
                setLoadingScore(false);
        }, 250);
        return () => {
            cancelled = true;
            window.clearTimeout(t);
        };
    }, [inputs, setLastScore]);
    // -----------------------------
    // APPROVAL COLOR
    // -----------------------------
    const approvalColor = useMemo(() => {
        const status = score?.approval_status ?? null;
        if (!status)
            return 'border-gray-200 bg-white text-gray-700';
        if (status === 'High Approval')
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        if (status === 'Moderate Approval')
            return 'border-blue-200 bg-blue-50 text-blue-700';
        return 'border-red-200 bg-red-50 text-red-700';
    }, [score?.approval_status]);
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 text-gray-900", children: [_jsx("header", { className: "sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-xl", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.18em] text-gray-500", children: "Fintech Simulator" }), _jsx("div", { className: "mt-1 text-2xl font-semibold tracking-tight text-gray-950", children: "Credit Score Intelligence" })] }), _jsx("div", { className: "text-right text-xs font-medium text-gray-500", children: "Session-based \u2022 Real-time" })] }) }), _jsxs(motion.main, { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: 'easeOut' }, className: "mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 xl:grid-cols-12", children: [_jsx("aside", { className: "space-y-6 xl:col-span-3 xl:sticky xl:top-24 self-start", children: _jsx(InputPanel, { inputs: inputs, onChange: (next) => setInputs(next) }) }), _jsxs("section", { className: "space-y-6 xl:col-span-6", children: [_jsx(ScoreDisplay, { score: score, loading: loadingScore, error: scoreError, approvalColor: approvalColor }), _jsx(FactorBreakdownView, { breakdown: score?.factor_breakdown ?? null }), _jsx(ScenarioComparison, { current: score, inputs: inputs, onCompare: simulateScenario }), _jsx(AnimatePresence, { children: score && (_jsx(motion.div, { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, className: "rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600 shadow-sm", children: "Tip: test one improvement at a time to understand which action creates the biggest lift." })) })] }), _jsxs("aside", { className: "space-y-6 xl:col-span-3 xl:sticky xl:top-24 self-start", children: [_jsx(AIExplanation, { disabled: !score, inputs: inputs, score: score, onExplain: async ({ question }) => {
                                    if (!score)
                                        throw new Error('Score missing');
                                    const payload = {
                                        inputs,
                                        credit_score: score.credit_score,
                                        factor_breakdown: score.factor_breakdown,
                                        // 🔥 force variation every time
                                        question: `${question} (give a slightly different perspective this time)`,
                                    };
                                    const res = await getExplanation(payload);
                                    return res;
                                } }), _jsx(ChatAssistant, { disabled: !score, inputs: inputs, score: score, onAsk: async ({ question, history }) => {
                                    if (!score)
                                        throw new Error('Score missing');
                                    const conversation = history
                                        ?.map((h) => `${h.role}: ${h.content}`)
                                        .join('\n');
                                    const payload = {
                                        inputs,
                                        credit_score: score.credit_score,
                                        factor_breakdown: score.factor_breakdown,
                                        // 🧠 memory injected here
                                        question: `
Previous conversation:
${conversation || "None"}

User question:
${question}
`,
                                    };
                                    const res = await getExplanation(payload);
                                    return res;
                                } })] })] })] }));
}
