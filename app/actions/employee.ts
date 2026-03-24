'use server'

import { createClient } from '@supabase/supabase-js'

// ✅ Helper to normalize values
const clean = (v: any) => v ?? null

type Allowance = {
  amount: string | number
}

type EmployeeForm = {
  employeeId?: string
  authUserId?: string
  employeeSlug?: string

  name: string
  email: string
  originalEmail?: string

  role?: string
  department?: string
  phone?: string
  alternativePhone?: string
  birthDate?: string

  homeAddress1?: string
  homeAddress2?: string

  userCompanyId: string
  joinedDate?: string
  contractType?: string
  contractStartDate?: string
  contractEndDate?: string
  probationEndDate?: string
  nextPromotionDate?: string
  employeeStatus?: string

  salaryType?: string
  baseSalary?: number | string
  tax_rate?: number | string
  pension_rate?: number | string
  allowancesJson?: Allowance[]

  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string

  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactPhone2?: string
  emergencyContactRelationship?: string
  emergencyContactEmail?: string
  emergencyContactCompany?: string
  emergencyContactAddress?: string

  notes?: string

  interViewScore?: number
  test?: string
  stage?: string
  interviewerName?: string
  hiringNote?: string
}

export async function createEmployeeAction(formData: EmployeeForm) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // -------------------------------------------------
    // ✅ 0️⃣ Validation
    // -------------------------------------------------
    if (!formData.email) throw new Error('Email is required')
    if (!formData.name) throw new Error('Name is required')
    if (!formData.userCompanyId) throw new Error('Company ID is required')

    const isEditMode = !!formData.employeeId
    let authUserId = formData.authUserId ?? null
    let customIdSlug = formData.employeeSlug ?? null

    // -------------------------------------------------
    // ✅ Base URL check
    // -------------------------------------------------
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_APP_URL
        : process.env.NEXT_PUBLIC_LIVE_URL

    if (!baseUrl) {
      throw new Error('Base URL is not configured')
    }

    // -------------------------------------------------
    // 1️⃣ CREATE MODE
    // -------------------------------------------------
    if (!isEditMode) {
      const { count, error: countError } = await supabaseAdmin
        .from('employees')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      const nextNumber = (count || 0) + 1
      const paddedNumber = nextNumber.toString().padStart(3, '0')

      const firstName = formData.name
        ? formData.name.split(' ')[0].toLowerCase()
        : 'employee'

      customIdSlug = `${firstName} ${paddedNumber}`

      // ✅ Create auth user
      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(
          formData.email,
          {
            data: { full_name: formData.name },
            redirectTo: `${baseUrl}/set-password`
          }
        )

      if (authError) throw new Error(authError.message)

      if (!authUser?.user?.id) {
        throw new Error('Failed to create auth user')
      }

      authUserId = authUser.user.id
    }

    // -------------------------------------------------
    // 2️⃣ EDIT MODE – Update email
    // -------------------------------------------------
    if (
      isEditMode &&
      authUserId &&
      formData.email !== formData.originalEmail
    ) {
      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          email: formData.email
        })

      if (updateError) throw updateError
    }

    // -------------------------------------------------
    // 3️⃣ Salary Calculations
    // -------------------------------------------------
    const base = Number(formData.baseSalary ?? 0)
    const taxRate = Number(formData.tax_rate ?? 0)
    const pensionRate = Number(formData.pension_rate ?? 0)

    const allowancesArray = Array.isArray(formData.allowancesJson)
      ? formData.allowancesJson
      : []

    const totalAllowancesValue = allowancesArray.reduce(
      (sum: number, item: Allowance) =>
        sum + (Number(item.amount) || 0),
      0
    )

    const taxAmount = base * (taxRate / 100)
    const pensionAmount = base * (pensionRate / 100)
    const totalDeductions = taxAmount + pensionAmount

    const netSalary =
      base + totalAllowancesValue - totalDeductions

    // -------------------------------------------------
    // 4️⃣ RPC CALL//
    // -------------------------------------------------
    const { data, error: rpcError } =
      await supabaseAdmin.rpc('add_employee_full', {
        p_employee_id: formData.employeeId ?? null,
        p_auth_user_id: authUserId,
        p_employee_id_slug: customIdSlug,

        p_name: formData.name,
        p_role: clean(formData.role),
        p_department: clean(formData.department),
        p_email: formData.email,
        p_phone: clean(formData.phone),
        p_alt_phone: clean(formData.alternativePhone),
        p_birth_date: clean(formData.birthDate),
        p_home_address1: clean(formData.homeAddress1),
        p_home_address2: clean(formData.homeAddress2),

        // Employment
        p_company_id: formData.userCompanyId,
        p_joined_date: clean(formData.joinedDate),
        p_contract_type: clean(formData.contractType),
        p_contract_start: clean(formData.contractStartDate),
        p_contract_end: clean(formData.contractEndDate),
        p_probation_end: clean(formData.probationEndDate),
        p_next_promotion: clean(formData.nextPromotionDate),
        p_employee_status: clean(formData.employeeStatus),

        // Salary
        p_salary_type: clean(formData.salaryType),
        p_base_salary: base,
        p_allowances_json: allowancesArray,
        p_tax_rate: taxRate,
        p_tax_amount: taxAmount,
        p_pension_rate: pensionRate,
        p_pension_amount: pensionAmount,
        p_deductions: totalDeductions,
        p_net_salary: netSalary,

        // Bank
        p_bank_name: clean(formData.bankName),
        p_bank_account_number: clean(formData.bankAccountNumber),
        p_bank_account_name: clean(formData.bankAccountName),

        // Emergency
        p_emergency_name: clean(formData.emergencyContactName),
        p_emergency_phone: clean(formData.emergencyContactPhone),
        p_emergency_phone2: clean(formData.emergencyContactPhone2),
        p_emergency_relationship: clean(formData.emergencyContactRelationship),
        p_emergency_email: clean(formData.emergencyContactEmail),
        p_emergency_company: clean(formData.emergencyContactCompany),
        p_emergency_address: clean(formData.emergencyContactAddress),

        p_notes: clean(formData.notes),

        // Assessment
        p_interview_score: formData.interViewScore ?? null,
        p_test: clean(formData.test),
        p_stage: clean(formData.stage),
        p_interviewer_name: clean(formData.interviewerName),
        p_hiring_note: clean(formData.hiringNote)
      })

    // -------------------------------------------------
    // ❗ Rollback if failed
    // -------------------------------------------------
    if (rpcError) {
      if (!isEditMode && authUserId) {
        await supabaseAdmin.auth.admin.deleteUser(authUserId)
      }
      throw rpcError
    }

    return { success: true, employeeId: data }
  } catch (error: any) {
    console.error('Error saving employee:', error)
    return { success: false, error: error.message }
  }
}