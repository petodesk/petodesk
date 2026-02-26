'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { createEmployeeAction } from '../actions/employee'
import warning_icon from '../assets/warning.png'
import Image from 'next/image'

export function AddEmployModal({
    onClose,
    employee
}: {
    onClose: () => void
    employee?: any
}) {

    const supabase = createClient()
    const isEdit = !!employee


    const [allowanceCart, setAllowanceCart] = useState<{ type: string, amount: number }[]>([]);
    const [tempType, setTempType] = useState('Transport');
    const [tempAmount, setTempAmount] = useState(0);
    // form state
    // Employee table fields
    const [name, setName] = useState(employee?.name ?? '')
    const [role, setRole] = useState(employee?.role ?? 'employee')
    const [department, setDepartment] = useState(employee?.department ?? '')
    const [email, setEmail] = useState(employee?.email ?? '')
    const [birthDate, setBirthDate] = useState(employee?.birthday ?? '')
    const [phone, setPhone] = useState<string | null>(employee?.phone ?? null)
    const [alternativePhone, setAlternativePhone] = useState<string | null>(employee?.alt_phone ?? null)
    const [homeAddress1, setHomeAddress1] = useState<string | null>(employee?.home_address1 ?? null)
    const [homeAddress2, setHomeAddress2] = useState<string | null>(employee?.home_address2 ?? null)
    const [userCompanyId, setUserCompanyId] = useState<string | null>(employee?.user_company_id ?? null)
    const [AddedBy, setAddedBy] = useState<string | null>(employee?.added_by ?? null)
    //employee info table fields
    const [joinedDate, setJoinedDate] = useState<string | null>(employee?.employee_info?.joined_date ?? null)
    const [contractType, setContractType] = useState<string | null>(employee?.employee_info?.contract_type ?? null)
    const [contractEndDate, setContractEndDate] = useState<string | null>(employee?.employee_info?.contract_end_date ?? null)
    const [contractStartDate, setContractStartDate] = useState<string | null>(employee?.employee_info?.contract_start_date ?? null)
    const [probationEndDate, setProbationEndDate] = useState<string | null>(employee?.employee_info?.probation_end_date ?? null)
    const [nextPromotionDate, setNextPromotionDate] = useState<string | null>(employee?.employee_info?.next_promotion_date ?? null)
    const [employeeStatus, setEmployeeStatus] = useState<string | null>(employee?.employee_info?.employee_status ?? 'pending')

    //salary info table fields
    const [salaryType, setSalaryType] = useState<string | null>(employee?.salary?.salary_type ?? null)
    const [baseSalary, setBaseSalary] = useState<string | null>(employee?.salary?.base_salary ?? null)

    const [tax_rate, setTax_rate] = useState<string | null>(employee?.salary?.tax_rate ?? null)
    const [pension_rate, setPensionRate] = useState<string | null>(employee?.salary?.pension_rate ?? null)
    const [bankName, setBankName] = useState<string | null>(employee?.salary?.bank_name ?? null)
    const [bankAccountNumber, setBankAccountNumber] = useState<string | null>(employee?.salary?.account_number ?? null)
    const [bankAccountName, setBankAccountName] = useState<string | null>(employee?.salary?.account_name ?? null)

    // reference fields
    const [emergencyContactName, setEmergencyContactName] = useState<string | null>(employee?.employee_reference?.name ?? null)
    const [emergencyContactPhone, setEmergencyContactPhone] = useState<string | null>(employee?.employee_reference?.phone1 ?? null)
    const [emergencyContactPhone2, setEmergencyContactPhone2] = useState<string | null>(employee?.employee_reference?.phone2 ?? null)
    const [emergencyContactRelationship, setEmergencyContactRelationship] = useState<string | null>(employee?.employee_reference?.relationship ?? null)
    const [emergencyContactEmail, setEmergencyContactEmail] = useState<string | null>(employee?.employee_reference?.email ?? null)
    const [emergencyContactCompany, setEmergencyContactCompany] = useState<string | null>(employee?.employee_reference?.company ?? null)

    const [emergencyContactAddress, setEmergencyContactAddress] = useState<string | null>(employee?.employee_reference?.address ?? null)
    const [notes, setNotes] = useState<string>('')
    // assessment fields
    const [interViewScore, setInterviewScore] = useState<string | null>(employee?.assessment?.interview_score ?? null)
    const [test, setTest] = useState<string | null>(employee?.assessment?.test ?? '')
    const [hiringNote, setHiringNote] = useState<string>(employee?.assessment?.hiring_note ?? '')
    const [stage, setStage] = useState<string | null>(employee?.assessment?.stage ?? null)
    const [interviewerName, setInterviewerName] = useState<string | null>(employee?.assessment?.interviewer_name ?? null)
    const [loading, setLoading] = useState(false)

console.log("Employee prop:", employee) // Debug log to check the employee prop
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setAddedBy(user.id)

            const { data: profile } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('id', user.id)
                .single()

            setUserCompanyId(profile?.company_id ?? null)
        }

        getUser()
    }, [])





    const addToCart = () => {
        if (!tempType || tempAmount <= 0) return;
        setAllowanceCart([...allowanceCart, { type: tempType, amount: tempAmount }]);
        setTempType('');
        setTempAmount(0);
    };


    const removeFromCart = (index: number) => {
        setAllowanceCart(allowanceCart.filter((_, i) => i !== index));
    };




    const handleSaveEmployee = async () => {
        if (!email || !name || !role) {
            alert("Please fill in required fields")
            return
        }

        setLoading(true)
        const authUserId = employee?.auth_user_id ?? null
        const employeeSlug = employee?.employee_id_slug ?? null

        const result = await createEmployeeAction({
            // 🔥 Critical for Edit Mode
            employeeId: isEdit ? employee.id : null,
            authUserId: authUserId,
            employeeSlug: employeeSlug,

            // Personal
            name,
            role,
            department,
            email,
            phone,
            alternativePhone,
            birthDate,
            homeAddress1,
            homeAddress2,
            userCompanyId,

            // Employment
            joinedDate,
            contractType,
            contractStartDate,
            contractEndDate,
            probationEndDate,
            nextPromotionDate,
            employeeStatus,

            // Salary
            salaryType,
            baseSalary,
            tax_rate,
            pension_rate,
            allowancesJson: allowanceCart,
            bankName,
            bankAccountNumber,
            bankAccountName,

            // Emergency
            emergencyContactName,
            emergencyContactPhone,
            emergencyContactPhone2,
            emergencyContactRelationship,
            emergencyContactEmail,
            emergencyContactCompany,
            emergencyContactAddress,
            notes,

            // Assessment
            interViewScore,
            test,
            stage,
            interviewerName,
            hiringNote
        })

        if (result.success) {
            alert(isEdit ? "Employee updated!" : "Employee added!")
            onClose()
        } else {
            alert(`Error: ${result.error}`)
        }

        setLoading(false)
    }


    useEffect(() => {
        if (employee?.salary?.allowances) {
            setAllowanceCart(employee.salary.allowances)
        } else {
            setAllowanceCart([])
        }
    }, [employee])




    const departments = [
        'Engineering',
        'Sales',
        'Marketing',
        'HR',
        'Finance',
        'Customer Support',
        'Operations',
        'Legal',
    ]
    const EmployeeStatus = [
        'pending',
        'active',
        'on_leave',
        'suspended',
        'inactive',]
    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-50 mx-4 w-full max-w-7xl mt-20 max-h-[90vh] rounded-xl bg-white shadow-lg flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? 'Edit Employee' : 'Add Employee'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-6">
                        <div className="border-b pb-4">
                            <h1 className="text-lg font-semibold">Personal Information</h1>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Input label=" Name *" value={name} onChange={setName} />
                                <Select options={departments} label="Department *" value={department} onChange={setDepartment} />
                                <Input label="Email *" value={email} onChange={setEmail} />
                                <Input label="Phone" value={phone} onChange={setPhone} />
                                <Input label="Alternative Phone" value={alternativePhone} onChange={setAlternativePhone} />
                                <Input label="Birth Date" type="date" value={birthDate} onChange={setBirthDate} />
                                <Input label="Home Address 1" value={homeAddress1} onChange={setHomeAddress1} />
                                <Input label="Home Address 2" value={homeAddress2} onChange={setHomeAddress2} />
                            </div>

                        </div>

                        <div className="border-b pb-4">
                            <h1 className="text-lg font-semibold">Employment Information</h1>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Select options={EmployeeStatus} label="Employee Status *" value={employeeStatus} onChange={setEmployeeStatus} />
                                <Input type='date' label="Date Joined" value={joinedDate} onChange={setJoinedDate} />
                                <Select options={['Permanent', 'Temporary', 'Contract']} label="Contract Type *" value={contractType} onChange={setContractType} />
                                <Input label="Contract Start Date" type="date" value={contractStartDate} onChange={setContractStartDate} />
                                <Input label="Contract End Date" type="date" value={contractEndDate} onChange={setContractEndDate} />
                                <Input label="Probation End Date" type="date" value={probationEndDate} onChange={setProbationEndDate} />
                                <Input label="Next Promotion Date" type="date" value={nextPromotionDate} onChange={setNextPromotionDate} />
                            </div>
                        </div>

                        <div className=" pb-4">
                            <h1 className="text-lg font-semibold">Salary Information</h1>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Select label="Salary Type" options={['Monthly', 'Weekly', 'Daily', 'Biweekly']} value={salaryType} onChange={setSalaryType} />
                                <Input label="Base Salary" type="number" value={baseSalary} onChange={setBaseSalary} />
                                <div className='flex flex-col gap-2 rounded-lg border p-4'>
                                    {/* UI to Add Allowance */}
                                    <Select label="Allowances Types" options={['Housing', 'Transport', 'Food', 'Medical', 'Other']} value={tempType} onChange={setTempType} />
                                    <div className='flex flex-col gap-2'>
                                        <h1>Allowance Amount</h1>

                                        <div className='flex gap-2'>

                                            <input className='input' type="number" value={tempAmount} onChange={(e) => setTempAmount(Number(e.target.value))} />
                                            <button className='btn-primary rounded-md text-white p-2' type="button" onClick={addToCart}>Add</button>


                                        </div>

                                    </div>

                                    {/* List (The "Cart") */}
                                    <ul>
                                        {allowanceCart.map((item, i) => (
                                            <li key={i} className='flex justify-between'>
                                                {item.type}: ${item.amount}
                                                <button className='size-4 text-red-500 hover:text-red-700 cursor-pointer' onClick={() => removeFromCart(i)}>x</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Input label="Tax %" type="number" value={tax_rate} onChange={setTax_rate} />
                                <Input label="Pension%" type="number" value={pension_rate} onChange={setPensionRate} />
                                <Input label="Bank Name" value={bankName} onChange={setBankName} />
                                <Input label="Bank Account Number" value={bankAccountNumber} onChange={setBankAccountNumber} />
                                <Input label="Bank Account Name" value={bankAccountName} onChange={setBankAccountName} />
                            </div>


                        </div>
                        <div className="pb-4">

                            <h1 className="text-lg font-semibold">Reference Information</h1>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Input label="Emergency Contact Name" value={emergencyContactName} onChange={setEmergencyContactName} />
                                <Input label="Emergency Contact Phone" value={emergencyContactPhone} onChange={setEmergencyContactPhone} />
                                <Input label="Emergency Contact Phone 2" value={emergencyContactPhone2} onChange={setEmergencyContactPhone2} />
                                <Input label="Emergency Contact Email" value={emergencyContactEmail} onChange={setEmergencyContactEmail} />
                                <Input label="Emergency Contact Company" value={emergencyContactCompany} onChange={setEmergencyContactCompany} />
                                <Input label="Emergency Contact Address" value={emergencyContactAddress} onChange={setEmergencyContactAddress} />
                                <Select options={['Spouse', 'Parent', 'Sibling', 'Friend', 'Uncle']} label="Emergency Contact Relationship *" value={emergencyContactRelationship} onChange={setEmergencyContactRelationship} />
                                <div className='w-full'>
                                    <label className="mb-1 block text-sm font-medium">Note</label>
                                    <textarea name="Hiring Note" id="hiringNote" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>

                                </div>
                            </div>


                        </div>
                        <div className="border-b pb-4">
                            <h1 className="text-lg font-semibold">Recruitment & Assessment</h1>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 ">
                                <Input label="Interview Score" value={interViewScore} onChange={setInterviewScore} />
                                <Select options={['Appitude', 'Technical', 'Skill Assessment']} label="Test *" value={test} onChange={setTest} />
                                <Input label="Interviewer" value={interviewerName} onChange={setInterviewerName} />

                                <Select options={['Applied', 'Interviewed', 'Selected', 'Onboarded']} label="Stage *" value={stage} onChange={setStage} />
                                <div className='w-full'>
                                    <label className="mb-1 block text-sm font-medium">Hiring Note</label>
                                    <textarea name="Hiring Note" id="hiringNote" value={hiringNote} onChange={(e) => setHiringNote(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>

                                </div>
                            </div>

                            <div className='mt-6'>
                                <h1 className="text-lg font-bold text-center mb-6">Documents</h1>

                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:grid-cols-5'>
                                    {/* Mapping logic for your documents */}
                                    {[
                                        "Probation / Appointment Letter",
                                        "Confirmation / Offer Letter",
                                        "ID",
                                        "Certificates",
                                        "Profile Picture"
                                    ].map((title, index) => (
                                        <div key={index} className="flex flex-col gap-2">
                                            <h1 className="text-sm font-medium text-gray-700">{title}</h1>
                                            <label className="flex flex-col items-center justify-center  h-14 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {/* File Icon */}
                                                    <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                                    </svg>
                                                </div>
                                                {/* Hidden actual file input */}
                                                <input disabled type="file" className="hidden" />
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {/* The Premium Warning Box */}
                                <div className="mt-8 flex items-center p-4 text-sm text-red-800 border border-red-100 rounded-xl bg-red-50" role="alert">
                                    <Image src={warning_icon} alt="Warning" className="w-8 h-8 mr-2" />
                                    <div className="text-center w-full font-medium">
                                        Uploading documents or profile images is a premium feature. <br />
                                        To add files, please upgrade your account. For assistance, contact support.
                                    </div>
                                </div>
                            </div>

                        </div>



                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-5 py-2 text-sm
                       text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={loading}
                        onClick={handleSaveEmployee}
                        className="rounded-lg bg-blue-600 px-8 py-2 text-sm text-white
                              hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? 'Saving…' : 'Save'}
                    </button>

                </div>


                <div className="h-4"></div>
            </div>
        </div>


    )
}

/* ---------------- INPUT ---------------- */

function Input({
    label,
    value,
    onChange,
    type = 'text',
    disabled = false,
}: {
    label: string
    value: any
    onChange?: (v: string) => void
    type?: string
    disabled?: boolean
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium">{label}</label>
            <input
                type={type}
                value={value ?? ''}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   disabled:bg-gray-100"
            />
        </div>
    )
}

/* ---------------- SELECT ---------------- */

function Select({
    label,
    value,
    onChange,
    options,
}: {
    label: string
    value: any
    onChange: (v: string) => void
    options: string[]
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium">{label}</label>
            <select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Select</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>

    )

}
