'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { AddEmployModal } from '@/app/components/AddEmployModal';


type Employee = {
    id: string
    employee_id_slug?: string
    name: string
    role: string
    created_at: string
    department: string
    birthday: string
    email: string
    home_address1: string
    home_address2: string
    phone: string
    image?: string
    employee_info?: {
        employee_status: string
        probation_end_date: string | null
        next_promotion_date: string | null
    }[]
    salary?: {
        salary_type: string
        base_salary: number
        allowance: number
        allowance_type: string
        deductions: number
        net_salary: number
    }[]
    assessment?: {
        test: string
        stage: string
        interview_score: number
        interviewer_name: string
        hiring_note: string
    }[]
    employee_reference?: {
        name: string
        relationship: string
        phone1: string
        email: string
        company: string
        address: string
    }[]
}

export default function EmployeeDetailsPage() {
    const { id } = useParams();
    const supabase = createClient();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [open, setOpen] = useState(false)

    useEffect(() => {
        async function getFullDetails() {
            const { data } = await supabase
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
            setEmployee(data);
        }
        getFullDetails();
    }, [id, supabase]);
    console.log(employee)
    if (!employee) return <div className="p-10">Loading profile...</div>;


    // 1. Logic to calculate dynamic values
    const statusData = [
        { label: "Employee Status", value: employee.employee_info?.[0]?.employee_status },
        { label: "Salary Type", value: employee.salary?.[0]?.salary_type },
        { label: "Base Salary", value: employee.salary?.[0]?.base_salary ? `$${employee.salary[0].base_salary.toLocaleString()}` : '0' },
        { label: "Allowances", value: `${employee.salary?.[0]?.allowance_type || ''} ${employee.salary?.[0]?.allowance ? `$${employee.salary[0].allowance.toLocaleString()}` : '0'}` },
    ];

    const hrGrowthData = [
        { label: "Probation End", value: employee.employee_info?.[0]?.probation_end_date || 'N/A' },
        { label: "Next Promotion", value: employee.employee_info?.[0]?.next_promotion_date || 'TBD' },
        { label: "Recruitment Stage", value: employee.assessment?.[0]?.stage || 'Completed' },
        { label: "Interview Score", value: `${employee.assessment?.[0]?.interview_score || 0}/100` },
    ];

    // 2. Logic to handle "Value" placeholders (Example for Leaves - needs your actual DB columns)
    const leaveData = [
        { label: "Leaves Status", value: "Active" }, // Derive from a 'leaves' table if joined
        { label: "Approved", value: "0" },
        { label: "Pending", value: "0" },
        { label: "Rejected", value: "0" },
    ];

    // Logic for Retention Insights Card
    const  desciplineRecords = [
        { label: "Total Warnings", value: "2 " },
        { label: "Current Risk Level ", value: "Low" },
        { label: " Last Warning Date", value: "None" },
        { label: " Next Review Date", value: "May 2025" },
        
    ];
 // Logic for Retention Insights Card
    const retentionData = [
        { label: "Tenure", value: "2 Years" },
        { label: "Internal Transfers", value: 0 },
        { label: "Final Warning", value: "None" },
        { label: "Training Completed", value: "3 Modules" },
        { label: "Current Salary", value: employee.salary?.[0]?.base_salary ? `SAR ${employee.salary[0].base_salary.toLocaleString()}` : 'N/A' },
        { label: "Last Increase", value: "Jan 2024" },
    ];

     const  performanceIndex = [
        { label: "Task Completion Rate ", value: "90%" },
        { label: "Attendance Score ", value: "90%" },
        { label: " Quality of Work ", value: "90%" },
        { label: "Team Collaboration Score", value: "90%" },
        
    ];
      const  behaviorIndicators = [
        { label: " Behavior Indicators ", value: "Good" },
        { label: " Communication Rating ", value: "Good" },
        { label: "  Policy Compliance ", value: "Good" },
        { label: "Manager Feedback", value: "Positive" },
        
    ];

    return (
        <section className="w-full px-6 py-6 bg-gray-50 max-h-screen overflow-y-auto scrollbar-none">
            {/* TOP ACTION BAR */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                    + Edit Employee
                </button>


            </div>

            {/* Summary card */}

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
                    <img src="https://placehold.co/200x200" alt="Employee Avatar" className="rounded-lg" />
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-semibold'>{employee.name}</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.role}</p>
                        <button className='btn-primary text-white py-2 px-4 rounded-lg'>Send Email</button>
                    </div>
                </div>
                <div className='mt-6 grid grid-cols-2 md:grid-cols-3 justify-between gap-4'>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'>Employee Id</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_id_slug}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'>Name</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.name}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium'>Role</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.role}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium'>Department</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.department}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium'>Email</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.email}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium'>Date of birth</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.birthday}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium'>phone</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.phone}</p>
                    </div>
                    <div>
                        <h1 className='text-md font-medium'> Address</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.home_address1}</p>
                    </div>
                </div>

            </div>
            <div className='mt-6 rounded-lg bg-white p-6 shadow-sm mb-6'>
                <h1 className='text-lg font-semibold'>Reference Information</h1>
                <div className='mt-6 grid grid-cols-2 md:grid-cols-3 gap-4'>

                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'>Name</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.[0]?.name}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'>Relationship</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.[0]?.relationship}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'>Company/ Organization</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.[0]?.company}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'>Email</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.[0]?.email}</p>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'>phone</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.[0]?.phone1}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'> Address</h1>
                        <p className='text-md font-medium text-gray-800'>{employee.employee_reference?.[0]?.address}</p>
                    </div>
                </div>

            </div>


            <div className='mt-6 rounded-lg bg-white p-6 shadow-sm mb-6'>
                <h1 className='text-lg font-semibold'> Recruitment & Assessment</h1>
                <div className='mt-6 grid grid-cols-2 md:grid-cols-3 gap-4'>

                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'>Interview Score</h1>
                        <p className='text-sm font-medium text-gray-800'>{employee.assessment?.[0]?.interview_score}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'> Assessment (Test Score)</h1>
                        <p className='text-sm font-medium text-gray-800'>{employee.assessment?.[0]?.test}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'>Recruitment Stage</h1>
                        <p className='text-sm font-medium text-gray-800'>{employee.assessment?.[0]?.stage}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-md font-medium'>Recruiter (Interviewer Name)</h1>
                        <p className='text-sm font-medium text-gray-800'>{employee.assessment?.[0]?.interviewer_name}</p>
                    </div>


                </div>
                <div className='mt-6 w-80'>

                    <h1 className='text-md font-medium'>Hiring Note</h1>
                    <p className='text-sm font-medium text-gray-800'>{employee.assessment?.[0]?.hiring_note }</p>
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
            {
                open && <AddEmployModal onClose={() => setOpen(false)} employee={employee} />
            }


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
                    <p className="text-sm font-semibold text-gray-800">{item.value || '—'}</p>
                </div>
            ))}
        </div>
    )
}