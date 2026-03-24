'use server'

import { createClient } from '@supabase/supabase-js'



export async function createEmployeeAction(formData:any) {
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
    // 1️⃣ CREATE MODE – Generate slug + Create Auth User
    // -------------------------------------------------
    if (!isEditMode) {
      // ⚠️ Still not perfect (best moved to DB), but kept as requested
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
           redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password`
          }
        )

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authUser?.user?.id) {
        throw new Error('Failed to create auth user')
      }

      authUserId = authUser.user.id
    }

    // -------------------------------------------------
    // 2️⃣ EDIT MODE – Update email only if changed
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
    // 3️⃣ Salary & Payroll Calculations
    // -------------------------------------------------
    const base = Number(formData.baseSalary ?? 0)
    const taxRate = Number(formData.tax_rate ?? 0)
    const pensionRate = Number(formData.pension_rate ?? 0)

    const allowancesArray = Array.isArray(formData.allowancesJson)
      ? formData.allowancesJson
      : []

    const totalAllowancesValue = allowancesArray.reduce(
      (sum: number, item: any) =>
        sum + (Number(item.amount) || 0),
      0
    )

    const taxAmount = base * (taxRate / 100)
    const pensionAmount = base * (pensionRate / 100)
    const totalDeductions = taxAmount + pensionAmount

    const netSalary =
      base + totalAllowancesValue - totalDeductions

    // -------------------------------------------------
    // 4️⃣ Call RPC
    // -------------------------------------------------
    const { data, error: rpcError } =
      await supabaseAdmin.rpc('add_employee_full', {
        p_employee_id: formData.employeeId ?? null,
        p_auth_user_id: authUserId,
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

        // Employment
        p_company_id: formData.userCompanyId,
        p_joined_date: formData.joinedDate || null,
        p_contract_type: formData.contractType,
        p_contract_start: formData.contractStartDate || null,
        p_contract_end: formData.contractEndDate || null,
        p_probation_end: formData.probationEndDate || null,
        p_next_promotion: formData.nextPromotionDate || null,
        p_employee_status: formData.employeeStatus,

        // Salary
        p_salary_type: formData.salaryType,
        p_base_salary: base,
        p_allowances_json: allowancesArray,
        p_tax_rate: taxRate,
        p_tax_amount: taxAmount,
        p_pension_rate: pensionRate,
        p_pension_amount: pensionAmount,
        p_deductions: totalDeductions,
        p_net_salary: netSalary,

        // Bank
        p_bank_name: formData.bankName,
        p_bank_account_number: formData.bankAccountNumber,
        p_bank_account_name: formData.bankAccountName,

        // Emergency
        p_emergency_name: formData.emergencyContactName,
        p_emergency_phone: formData.emergencyContactPhone,
        p_emergency_phone2: formData.emergencyContactPhone2,
        p_emergency_relationship:
          formData.emergencyContactRelationship,
        p_emergency_email:
          formData.emergencyContactEmail,
        p_emergency_company:
          formData.emergencyContactCompany,
        p_emergency_address:
          formData.emergencyContactAddress,

        p_notes: formData.notes,

        // Assessment
        p_interview_score: formData.interViewScore,
        p_test: formData.test,
        p_stage: formData.stage,
        p_interviewer_name: formData.interviewerName,
        p_hiring_note: formData.hiringNote
      })

    // -------------------------------------------------
    // ❗ Rollback auth user if RPC fails
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