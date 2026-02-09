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

    // form state
    // Employee table fields
    const [name, setName] = useState(employee?.name ?? '')
    const [role, setRole] = useState(employee?.role ?? '')
    const [department, setDepartment] = useState(employee?.department ?? '')
    const [email, setEmail] = useState(employee?.email ?? '')
    const [birthDate, setBirthDate] = useState(employee?.birth_date ?? '')
    const [phone, setPhone] = useState<string | null>(employee?.phone ?? null)
    const [alternativePhone, setAlternativePhone] = useState<string | null>(employee?.alternative_phone ?? null)
    const [homeAddress1, setHomeAddress1] = useState<string | null>(employee?.home_address1 ?? null)
    const [homeAddress2, setHomeAddress2] = useState<string | null>(employee?.home_address2 ?? null)
    const [userCompanyId, setUserCompanyId] = useState<string | null>(employee?.user_company_id ?? null)
    const [AddedBy, setAddedBy] = useState<string | null>(employee?.added_by ?? null)
    //employee info table fields
    const [joinedDate, setJoinedDate] = useState<string | null>(employee?.employee_info?.[0]?.joined_date ?? null)
    const [contractType, setContractType] = useState<string | null>(employee?.employee_info?.[0]?.contract_type ?? null)
    const [contractEndDate, setContractEndDate] = useState<string | null>(employee?.employee_info?.[0]?.contract_end_date ?? null)
    const [contractStartDate, setContractStartDate] = useState<string | null>(employee?.employee_info?.[0]?.contract_start_date ?? null)
    const [probationEndDate, setProbationEndDate] = useState<string | null>(employee?.employee_info?.[0]?.probation_end_date ?? null)
    const [nextPromotionDate, setNextPromotionDate] = useState<string | null>(employee?.employee_info?.[0]?.next_promotion_date ?? null)
    const [employeeStatus, setEmployeeStatus] = useState<string | null>(employee?.employee_info?.[0]?.employee_status ?? null)

    //salary info table fields
    const [salaryType, setSalaryType] = useState<string | null>(employee?.salary?.[0]?.salary_type ?? null)
    const [baseSalary, setBaseSalary] = useState<string | null>(employee?.salary?.[0]?.base_salary ?? null)
    const [allowances, setAllowances] = useState<string | null>(employee?.salary?.[0]?.allowance ?? null)
    const [allowancesTypes, setAllowancesTypes] = useState<string | null>(employee?.salary?.[0]?.allowance_types ?? null)
    const [deductions, setDeductions] = useState<string | null>(employee?.salary?.[0]?.deductions ?? null)
    const [netSalary, setNetSalary] = useState<string | null>(employee?.salary?.[0]?.net_salary ?? null)
    const [bankName, setBankName] = useState<string | null>(employee?.salary?.[0]?.bank_name ?? null)
    const [bankAccountNumber, setBankAccountNumber] = useState<string | null>(employee?.salary?.[0]?.account_number ?? null)
    const [bankAccountName, setBankAccountName] = useState<string | null>(employee?.salary?.[0]?.account_name ?? null)
    const [bankRoutingNumber, setBankRoutingNumber] = useState<string | null>(employee?.salary?.[0]?.bank_routing_number ?? null)

    // reference fields
    const [emergencyContactName, setEmergencyContactName] = useState<string | null>(employee?.employee_reference?.[0]?.name ?? null)
    const [emergencyContactPhone, setEmergencyContactPhone] = useState<string | null>(employee?.employee_reference?.[0]?.phone1 ?? null)
    const [emergencyContactPhone2, setEmergencyContactPhone2] = useState<string | null>(employee?.employee_reference?.[0]?.phone2 ?? null)
    const [emergencyContactRelationship, setEmergencyContactRelationship] = useState<string | null>(employee?.employee_reference?.[0]?.relationship ?? null)
    const [emergencyContactEmail, setEmergencyContactEmail] = useState<string | null>(employee?.employee_reference?.[0]?.email ?? null)
    const [emergencyContactCompany, setEmergencyContactCompany] = useState<string | null>(employee?.employee_reference?.[0]?.company ?? null)

    const [emergencyContactAddress, setEmergencyContactAddress] = useState<string | null>(employee?.employee_reference?.[0]?.address ?? null)
    const [company, setCompany] = useState<string | null>(employee?.employee_reference?.[0]?.company ?? null)
    const [notes, setNotes] = useState<string>('')
    // assessment fields
    const [interViewScore, setInterviewScore] = useState<string | null>(employee?.assessment?.[0]?.interview_score ?? null)
    const [test, setTest] = useState<string | null>(employee?.assessment?.[0]?.test ?? null)
    const [hiringNote, setHiringNote] = useState<string>(employee?.assessment?.[0]?.hiring_note ?? '')
    const [stage, setStage] = useState<string | null>(employee?.assessment?.[0]?.stage ?? null)
    const [interviewerName, setInterviewerName] = useState<string | null>(employee?.assessment?.[0]?.interviewer_namnull)
    const [loading, setLoading] = useState(false)

    const supabse = createClient()

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

    const handleSaveEmployee = async () => {
        if (!email || !name || !role) {
            alert("Please fill in required fields (Name, Email, Role)")
            return
        }

        setLoading(true)
        const result = await createEmployeeAction({
            name, role, department, email, phone, alternativePhone, birthDate,
            homeAddress1, homeAddress2, userCompanyId, joinedDate, contractType,
            contractStartDate, contractEndDate, probationEndDate, nextPromotionDate,
            employeeStatus, salaryType, baseSalary, allowances, allowancesTypes,
            deductions, netSalary, bankName, bankAccountNumber, bankAccountName,
            bankRoutingNumber, emergencyContactName, emergencyContactPhone,
            emergencyContactPhone2, emergencyContactRelationship, emergencyContactEmail, emergencyContactCompany,
            emergencyContactAddress, notes, interViewScore, test, stage,
            interviewerName, hiringNote
        })

        if (result.success) {
            alert("Employee added and Auth user created!")
            onClose()
        } else {
            alert(`Error: ${result.error}`)
        }
        setLoading(false)
    }




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
    const employeeStatusOptions = ['Active', 'On Leave', 'Resigned', 'Terminated',]
    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-50 mx-4 w-full max-w-7xl md:mt-30 max-h-[90vh] rounded-xl bg-white shadow-lg flex flex-col">

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
                                <Select options={['admin', 'employee']} label="Role *" value={role} onChange={setRole} />
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
                                <Input label="Company" value={company} onChange={setCompany} />
                                <Select options={employeeStatusOptions} label="Employee Status *" value={employeeStatus} onChange={setEmployeeStatus} />
                                <Input type='date' label="Date Joined" value={joinedDate} onChange={setJoinedDate} />
                                <Select options={['Permanent', 'Temporary', 'Contract']} label="Contract Type *" value={contractType} onChange={setContractType} />
                                <Input label="Contract Start Date" type="date" value={contractStartDate} onChange={setContractStartDate} />
                                <Input label="Contract End Date" type="date" value={contractEndDate} onChange={setContractEndDate} />
                                <Input label="Probation End Date" type="date" value={probationEndDate} onChange={setProbationEndDate} />
                                <Input label="Next Promotion Date" type="date" value={nextPromotionDate} onChange={setNextPromotionDate} />
                                <Select label="Salary Type" options={['Monthly', 'Weekly', 'Daily']} value={salaryType} onChange={setSalaryType} />
                                <Input label="Base Salary" type="number" value={baseSalary} onChange={setBaseSalary} />
                                <Select label="Allowances Types" options={['Housing', 'Transport', 'Food', 'Medical', 'Other']} value={allowancesTypes} onChange={setAllowancesTypes} />
                                <Input label="Allowance" type="number" value={allowances} onChange={setAllowances} />
                                <Input label="Deductions" type="number" value={deductions} onChange={setDeductions} />
                                <Input label="Net Salary" type="number" value={netSalary} onChange={setNetSalary} />
                                <Input label="Bank Name" value={bankName} onChange={setBankName} />
                                <Input label="Bank Account Number" value={bankAccountNumber} onChange={setBankAccountNumber} />
                                <Input label="Bank Account Name" value={bankAccountName} onChange={setBankAccountName} />
                                <Input label="Bank Routing Number" value={bankRoutingNumber} onChange={setBankRoutingNumber} />
                            </div>


                        </div>
                        <div className="border-b pb-4">

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
                value={value}
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
