'use client'

import { useState } from "react";
import { createClient } from "../utils/supabase/client";
import { useCompany } from "../context/CompanyContext";

export default function AddPerformanceModal({
    onClose,
    open,
    employee
}: {
    onClose: () => void,
    open: boolean,
    employee: any
}) {
    if (!open) return null;

    const [warning, setWarning] = useState('0');
    const [comment, setComment] = useState('');
    const [period, setPeriod] = useState('monthly');
    const [score, setScore] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { company, profile } = useCompany();
    const supabase = createClient();

    const handleSavePerformance = async () => {
        setErrorMsg('');

        // 🔍 Validation
        if (!employee?.auth_user_id) {
            setErrorMsg("Invalid employee");
            return;
        }

        if (!company?.id) {
            setErrorMsg("Company not found");
            return;
        }

        if (!period) {
            setErrorMsg("Please select period");
            return;
        }

        if (score === '' || score < 0 || score > 100) {
            setErrorMsg("Score must be between 0 and 100");
            return;
        }

        try {
            setLoading(true);

            // 🔍 check if exists
            const { data: existing, error: fetchError } = await supabase
                .from('performance')
                .select('id')
                .eq('employee_id', employee.auth_user_id)
                .eq('period', period)
                .maybeSingle();

            if (fetchError) throw fetchError;

            const payload = {
                employee_id: employee.auth_user_id,
                company_id: company.id,
                warning: Number(warning),
                comments: comment,
                period,
                reviewed_by: profile?.id,
                score: Number(score)
            };

            if (existing) {
                // 🔄 UPDATE
                const { error: updateError } = await supabase
                    .from('performance')
                    .update(payload)
                    .eq('id', existing.id);

                if (updateError) throw updateError;

            } else {
                // ➕ INSERT
                const { error: insertError } = await supabase
                    .from('performance')
                    .insert(payload);

                if (insertError) throw insertError;
            }

            // ✅ Reset form
            setWarning('0');
            setComment('');
            setPeriod('monthly');
            setScore('');

            // ✅ Close modal
            onClose();

        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="z-50 bg-white rounded-xl p-6 max-w-3xl w-full shadow-lg">
                <h1 className="text-lg font-semibold mb-4">
                    Add Performance for {employee?.name}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Warning */}
                    <div>
                        <label className="text-sm text-gray-500">Warning Status</label>
                        <select
                            className="w-full mt-1 border rounded-md p-2"
                            value={warning}
                            onChange={(e) => setWarning(e.target.value)}
                        >
                            <option value="0">No Warning</option>
                            <option value="1">First Warning</option>
                            <option value="2">Second Warning</option>
                            <option value="3">Final Warning</option>
                        </select>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="text-sm text-gray-500">Comments</label>
                        <input
                            type="text"
                            className="w-full mt-1 border rounded-md p-2"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Optional comment..."
                        />
                    </div>

                    {/* Period */}
                    <div>
                        <label className="text-sm text-gray-500">Period</label>
                        <select
                            className="w-full mt-1 border rounded-md p-2"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    {/* Score */}
                    <div>
                        <label className="text-sm text-gray-500">Score</label>
                        <input
                            type="number"
                            className="w-full mt-1 border rounded-md p-2"
                            value={score}
                            onChange={(e) =>
                                setScore(e.target.value === '' ? '' : Number(e.target.value))
                            }
                            placeholder="0 - 100"
                        />
                    </div>
                </div>

                {/* Error */}
                {errorMsg && (
                    <p className="text-red-500 text-sm mt-3">{errorMsg}</p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSavePerformance}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}