'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { AddEmployModal } from '@/app/components/AddEmployModal';
import Link from 'next/dist/client/link';

type Employee = {
    id: string;
    employee_id_slug?: string;
    name: string;
    role: string;
    created_at: string;
    department: string;
    birthday: string;
    email: string;
    home_address1: string;
    home_address2: string;
    phone: string;
    image?: string;

    employee_info?: {
        employee_status: string;
        probation_end_date: string | null;
        next_promotion_date: string | null;
    } | null;

    salary?: {
        salary_type: string
        base_salary: number
        allowances: {
            type: string
            amount: number
        }[]
        pension_amount: number
        tax_amount: number
        deductions: number
        net_salary: number
    } | null

    assessment?: {
        test: string;
        stage: string;
        interview_score: number;
        interviewer_name: string;
        hiring_note: string;
    } | null;

    employee_reference?: {
        name: string;
        relationship: string;
        phone1: string;
        email: string;
        company: string;
        address: string;
    } | null;
};

export default function EmployeeDetailsPage() {
    const { id } = useParams();
    const supabase = createClient();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [open, setOpen] = useState(false)

    useEffect(() => {
        async function getFullDetails() {
            const { data, error } = await supabase
                .from('employees')
                .select(`
                    *,
                    employee_info (*),
                    salary (*),
                    assessment (*),
                    employee_reference (*)
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error(error);
                return;
            }

            // Robust check: if join returns array, take index 0, otherwise take data as is
            setEmployee({
                ...data,
                employee_info: Array.isArray(data.employee_info) ? data.employee_info[0] : data.employee_info ?? null,
                salary: Array.isArray(data.salary) ? data.salary[0] : data.salary ?? null,
                assessment: Array.isArray(data.assessment) ? data.assessment[0] : data.assessment ?? null,
                employee_reference: Array.isArray(data.employee_reference) ? data.employee_reference[0] : data.employee_reference ?? null,
            });
        }
        getFullDetails();
    }, [id]);

    const handleModalClose = () => {
        setOpen(false);
        // Refetch employee details after closing the modal to get updated data
        supabase
            .from('employees')
            .select(`
                *,
                employee_info (*),
                salary (*),
                assessment (*),
                employee_reference (*)
            `)
            .eq('id', id)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error(error);
                    return;
                }
                setEmployee({
                    ...data,
                    employee_info: Array.isArray(data.employee_info) ? data.employee_info[0] : data.employee_info ?? null,
                    salary: Array.isArray(data.salary) ? data.salary[0] : data.salary ?? null,
                    assessment: Array.isArray(data.assessment) ? data.assessment[0] : data.assessment ?? null,
                    employee_reference: Array.isArray(data.employee_reference) ? data.employee_reference[0] : data.employee_reference ?? null,
                });
            });
    };

    if (!employee) return <div className="p-10 text-center text-gray-500">Loading profile...</div>;

    // --- FINANCIAL LOGIC (Fixing the numeric fetch) ---
    const salaryData = employee?.salary;
    const allowancesArr = Array.isArray(salaryData?.allowances) ? salaryData.allowances : [];

    // Convert strings to Numbers to ensure toLocaleString() and math works
    const totalAllowance = allowancesArr.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
    const taxAmount = Number(salaryData?.tax_amount) || 0;
    const pensionAmount = Number(salaryData?.pension_amount) || 0;
    const baseSalary = Number(salaryData?.base_salary) || 0;
    const netSalary = Number(salaryData?.net_salary) || 0;
    const totalDeductions = taxAmount + pensionAmount;

    // 1. Logic to calculate dynamic values
    const statusData = [
        { label: "Employee Status", value: employee.employee_info?.employee_status },
        { label: "Salary Type", value: employee.salary?.salary_type },
        { label: "Base Salary", value: baseSalary ? ` ${baseSalary.toLocaleString()}` : '0' },
        { label: "Allowances", value: `${totalAllowance.toLocaleString()}` },
        { label: "Deductions", value: `${totalDeductions.toLocaleString()}` },
        { label: "Net Salary", value: netSalary ? ` ${netSalary.toLocaleString()}` : '0' },
    ];

    const hrGrowthData = [
        { label: "Probation End", value: employee.employee_info?.probation_end_date || 'N/A' },
        { label: "Next Promotion", value: employee.employee_info?.next_promotion_date || 'TBD' },
        { label: "Recruitment Stage", value: employee.assessment?.stage || 'Completed' },
        { label: "Interview Score", value: `${employee.assessment?.interview_score || 0}/100` },
    ];

    const leaveData = [
        { label: "Leaves Status", value: "Active" },
        { label: "Approved", value: "0" },
        { label: "Pending", value: "0" },
        { label: "Rejected", value: "0" },
    ];

    const desciplineRecords = [
        { label: "Total Warnings", value: "2 " },
        { label: "Current Risk Level ", value: "Low" },
        { label: " Last Warning Date", value: "None" },
        { label: " Next Review Date", value: "May 2025" },
    ];

    const retentionData = [
        { label: "Tenure", value: "2 Years" },
        { label: "Internal Transfers", value: 0 },
        { label: "Final Warning", value: "None" },
        { label: "Training Completed", value: "3 Modules" },
        { label: "Current Salary", value: baseSalary ? `S${baseSalary.toLocaleString()}` : 'N/A' },
        { label: "Last Increase", value: "Jan 2024" },
    ];

    const performanceIndex = [
        { label: "Task Completion Rate ", value: "90%" },
        { label: "Attendance Score ", value: "90%" },
        { label: " Quality of Work ", value: "90%" },
        { label: "Team Collaboration Score", value: "90%" },
    ];

    const behaviorIndicators = [
        { label: " Behavior Indicators ", value: "Good" },
        { label: " Communication Rating ", value: "Good" },
        { label: "  Policy Compliance ", value: "Good" },
        { label: "Manager Feedback", value: "Positive" },
    ];

    return (
        <section className="w-full px-6 py-6 bg-gray-50 max-h-screen overflow-y-auto scrollbar-none">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-20">
                <button className='btn-secondary rounded-lg p-2'>
                    <Link href="/dashboard/employee" className="text-gray-600 hover:text-gray-800 text-white text-sm">
                        &larr; Back to Employees
                    </Link>
                </button>
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                    + Edit Employee
                </button>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard title="Status" items={statusData} />
                <SummaryCard title="HR Action - Growth" items={hrGrowthData} />
                <SummaryCard title="Leave Requests" items={leaveData} />
                <SummaryCard title="Discipline Records" items={desciplineRecords} />
                <SummaryCard title="Performance Index" items={performanceIndex} />
                <SummaryCard title="Behavior Indicators" items={behaviorIndicators} />
            </div>

            <SummaryCard title="Retention Insights" items={retentionData} />

            <div className='mt-6 rounded-lg bg-white p-6 shadow-sm mb-6'>
                <div className='flex max-sm:justify-between items-center gap-10'>
                    <img src={employee.image || "https://placehold.co/200x200"} alt="Employee Avatar" className="rounded-lg w-32 h-32 object-cover" />
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-semibold'>{employee.name}</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.role}</p>
                        <button className='bg-blue-600 text-white py-2 px-4 rounded-lg'>Send Email</button>
                    </div>
                </div>
                <div className='mt-6 grid grid-cols-2 md:grid-cols-3 justify-between gap-4'>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'>Employee Id</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_id_slug}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'>Name</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.name}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium text-gray-500'>Role</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.role}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium text-gray-500'>Department</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.department}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium text-gray-500'>Email</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.email}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium text-gray-500'>Date of birth</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.birthday}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium text-gray-500'>phone</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.phone}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium text-gray-500'> Address</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.home_address1}</p>
                    </div>
                </div>
            </div>

            <div className='mt-6 rounded-lg bg-white p-6 shadow-sm mb-6'>
                <h1 className='text-lg font-semibold'>Reference Information</h1>
                <div className='mt-6 grid grid-cols-2 md:grid-cols-3 gap-4'>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'>Name</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.name}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'>Relationship</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.relationship}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'>Company/ Organization</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.company}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'>Email</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.email}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'>phone</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.phone1}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'> Address</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.address}</p>
                    </div>
                </div>
            </div>

            <div className='mt-6 rounded-lg bg-white p-6 shadow-sm mb-6'>
                <h1 className='text-lg font-semibold'> Recruitment & Assessment</h1>
                <div className='mt-6 grid grid-cols-2 md:grid-cols-3 gap-4'>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'>Interview Score</h1>
                        <p className='text-sm font-medium text-gray-800'>{employee.assessment?.interview_score}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'> Assessment (Test Score)</h1>
                        <p className='text-sm font-medium text-gray-800'>{employee.assessment?.test}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'>Recruitment Stage</h1>
                        <p className='text-sm font-medium text-gray-800'>{employee.assessment?.stage}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium text-gray-500'>Recruiter (Interviewer Name)</h1>
                        <p className='text-sm font-medium text-gray-800'>{employee.assessment?.interviewer_name}</p>
                    </div>
                </div>
                <div className='mt-6 w-80'>
                    <h1 className='text-md font-medium text-gray-500'>Hiring Note</h1>
                    <p className='text-sm font-medium text-gray-800'>{employee.assessment?.hiring_note}</p>
                </div>
            </div>

            <div className='mt-6 rounded-lg bg-white p-6 shadow-sm mb-6'>
                <h1 className='text-lg font-semibold'> Documents</h1>
                <div className='mt-6 grid grid-cols-2 md:grid-cols-3 gap-4'>
                    <div className='flex items-center gap-2'>
                        <input type="checkbox" name="probationAppointmentLetter" id="probationAppointmentLetter" />
                        <h1 className='text-md font-medium'> Probation / Appointment Letter</h1>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input type="checkbox" name="confirmationOfferLetter" id="confirmationOfferLetter" />
                        <h1 className='text-md font-medium'>  Confirmation / Offer Letter</h1>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input type="checkbox" name="profilePicture" id="profilePicture" />
                        <h1 className='text-md font-medium'> Profile Picture</h1>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input type="checkbox" name="id" id="id" />
                        <h1 className='text-md font-medium'> ID</h1>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input type="checkbox" name="certificates" id="certificates" />
                        <h1 className='text-md font-medium'> Certificates</h1>
                    </div>
                </div>
            </div>

            {open && <AddEmployModal onClose={handleModalClose} employee={employee} />}
        </section>
    )
}

function SummaryCard({ title, items }: { title: string, items: { label: string, value?: string | number }[] }) {
    return (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <p className="text-lg font-medium text-gray-900 pb-3 mb-2 border-b border-gray-50">{title}</p>
            {items.map((item, index) => (
                <div key={index} className='flex items-center justify-between gap-2 py-2 border-b last:border-0 border-gray-100'>
                    <p className="text-sm text-gray-600">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{item.value || '—'}</p>
                </div>
            ))}
        </div>
    )
}