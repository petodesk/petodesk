'use server'

import { createClient } from '@supabase/supabase-js'

export async function createEmployeeAction(formData: any) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Generate the Custom Employee ID (e.g., "sudais 001")
    const { count } = await supabaseAdmin
      .from('employees')
      .select('*', { count: 'exact', head: true })

    const nextNumber = (count || 0) + 1
    const paddedNumber = nextNumber.toString().padStart(3, '0')
    const firstName = formData.name ? formData.name.split(' ')[0].toLowerCase() : 'employee'
    const customIdSlug = `${firstName} ${paddedNumber}`

    // 2. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: 'TempPassword123!',
      email_confirm: true,
      user_metadata: { full_name: formData.name }
    })

    if (authError) throw authError

    // --- 3.Salary & Payroll Calculation Logic ---
    const base = Number(formData.baseSalary ?? 0)
    const taxRate = Number(formData.tax_rate ?? 0)
    const pensionRate = Number(formData.pension_rate ?? 0)

    // Parse the allowances JSON and calculate the total sum
    const allowancesArray = Array.isArray(formData.allowancesJson)
  ? formData.allowancesJson
  : []


    // Sum all allowance amounts
    const totalAllowancesValue = allowancesArray.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);

    // Calculations based on Base Salary
    const taxAmount = base * (taxRate / 100)
    const pensionAmount = base * (pensionRate / 100)
    const totalDeductions = taxAmount + pensionAmount

    // Final Net Salary calculation
    const netSalary = (base + totalAllowancesValue) - totalDeductions

    // 4. Call RPC Function to Insert Employee
    const { data, error: rpcError } = await supabaseAdmin.rpc('add_employee_full', {
      p_auth_user_id: authUser.user.id,
      p_employee_id_slug: customIdSlug,
      p_name: formData.name,
      p_role: formData.role,
      p_department: formData.department,
      p_email: formData.email,
      p_phone: formData.phone,
      p_alt_phone: formData.alternativePhone,
      p_birth_date: formData.birthDate || null,
      p_home_address1: formData.homeAddress1,
      p_home_address2: formData.homeAddress2,

      // Employment Details
      p_company_id: formData.userCompanyId,
      p_joined_date: formData.joinedDate || null,
      p_contract_type: formData.contractType,
      p_contract_start: formData.contractStartDate || null,
      p_contract_end: formData.contractEndDate || null,
      p_probation_end: formData.probationEndDate || null,
      p_next_promotion: formData.nextPromotionDate || null,
      p_employee_status: formData.employeeStatus,

      // Salary Details (Calculated)
      p_salary_type: formData.salaryType,
      p_base_salary: base,
      p_allowances_json: allowancesArray,
      p_tax_rate: taxRate,
      p_tax_amount: taxAmount,
      p_pension_rate: pensionRate,
      p_pension_amount: pensionAmount,
      p_deductions: totalDeductions,
      p_net_salary: netSalary,

      // Bank Details
      p_bank_name: formData.bankName,
      p_bank_account_number: formData.bankAccountNumber,
      p_bank_account_name: formData.bankAccountName,

      // Emergency Details
      p_emergency_name: formData.emergencyContactName,
      p_emergency_phone: formData.emergencyContactPhone,
      p_emergency_phone2: formData.emergencyContactPhone2,
      p_emergency_relationship: formData.emergencyContactRelationship,
      p_emergency_email: formData.emergencyContactEmail,
      p_emergency_company: formData.emergencyContactCompany,
      p_emergency_address: formData.emergencyContactAddress,
      p_notes: formData.notes,

      // Assessment Details
      p_interview_score: formData.interViewScore,
      p_test: formData.test,
      p_stage: formData.stage,
      p_interviewer_name: formData.interviewerName,
      p_hiring_note: formData.hiringNote
    })

    if (rpcError) throw rpcError

    return { success: true, employeeId: data }
  } catch (error: any) {
    console.error('Error adding employee:', error)
    return { success: false, error: error.message }
  }
}