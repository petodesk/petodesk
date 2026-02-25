'use client';

import { createClient } from '@/app/utils/supabase/client';
import { useEffect, useState } from 'react';
import { HiSearch } from 'react-icons/hi';
import { toast } from 'react-toastify';

export default function PayrollTrigger() {
  const [userCompanyId, setUserCompanyId] = useState(null);
  const [search, setSearch] = useState('')
  const supabase = createClient();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPayroll, setProcessingPayroll] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      setUserCompanyId(profile?.company_id ?? null)
    }

    getUser()
  }, [])

  const fetchPayroll = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('payroll')
      .select(`
        id,
        payroll_name,
        pay_period,
        role,
        base_salary,
        deduction,
        net_salary,
        status,
        created_at,
        employee:employees (
          id,
          name
        )
      `)
      .eq('company_id', userCompanyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPayrolls(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!userCompanyId) return;


    fetchPayroll();
  }, [userCompanyId]);

  const filteredPayrolls = payrolls.filter((p) => {
    const name =
      `${p.employee.name ?? ''}`.toLowerCase();

    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      p.role?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPayroll = payrolls.reduce(
    (sum, p) => sum + Number(p.base_salary || 0),
    0
  );

  const totalDeductions = payrolls.reduce(
    (sum, p) => sum + Number(p.deduction || 0),
    0
  );

  const totalNet = payrolls.reduce(
    (sum, p) => sum + Number(p.net_salary || 0),
    0
  );




  const handleRunPayroll = async () => {
    // 1. Setup Time-based strings for your table columns
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    // Formats: "January 2026 Payroll" and "2026-01"
    const payrollName = `${monthName} ${year} Payroll`;
    const payPeriod = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    try {
      setProcessingPayroll(true);
      // Check if payroll already exists for this month
      const { data: existingPayroll } = await supabase
        .from('payroll')
        .select('id')
        .eq('company_id', userCompanyId)
        .eq('pay_period', payPeriod)
        .limit(1);

      if (existingPayroll && existingPayroll.length > 0) {
        toast.error(`Payroll for ${payPeriod} already exists.`);
        setProcessingPayroll(false);
        return;

      }
      // 2. Fetch Active Employees
      // We use !inner on employee_info to filter only 'Active' status
      const { data: activeEmployees, error: fetchError } = await supabase
        .from('employees')
        .select(`
                id,
                role,
                company_id,
                employee_info!inner(employee_status),
                salary!inner(
                  base_salary,
                  allowances,
                  tax_amount,
                  pension_amount,
                  deduction,
                  net_salary
    )
  `)
        .eq('company_id', userCompanyId) // filter by company
        .eq('employee_info.employee_status', 'active');

      if (fetchError) throw fetchError;
      if (!activeEmployees || activeEmployees.length === 0) {
        alert("No active employees found to process.");
        return;
      }
      console.log("Active Employees for Payroll:", activeEmployees);
      // 3. Map Data to 'payroll' table structure
      const payrollEntries = activeEmployees.map(emp => {
        const salary = emp.salary as any;

        return {
          employee_id: emp.id,
          payroll_name: payrollName,
          pay_period: payPeriod,
          role: emp.role,
          base_salary: Number(salary?.base_salary) || 0,
          allowances: salary?.allowances || [],
          deduction: Number(salary?.deduction) || 0,
          net_salary: Number(salary?.net_salary) || 0,
          company_id: userCompanyId,
          status: 'ready'
        };
      });

      // 4. Insert into the 'payroll' table
      const { error: insertError } = await supabase
        .from('payroll')
        .insert(payrollEntries);

      if (insertError) throw insertError;

      toast.success(`Success: ${payrollEntries.length} employees added to ${payrollName}.`);
      setProcessingPayroll(false);
      fetchPayroll(); // Refresh the payroll list to show new entries
    } catch (err) {
      console.error("Payroll Trigger Error:", err);
      toast.error("Could not run payroll. See console for details.");
    }
  };


  function ActionMenu(payroll: any) {
    const [open, setOpen] = useState(false)

    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="text-lg font-bold text-gray-600 cursor-pointer hover:bg-gray-100 rounded-full p-1"
        >
          ⋮
        </button>

        {open && (
          <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border bg-white shadow-lg">
            <ul className="py-1 text-sm">


              <li

                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              >
                View
              </li>
              <li

                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              >
                Edit
              </li>



              <li

                className="cursor-pointer px-4 py-2  hover:bg-gray-100"
              >
                Hold
              </li>
              <li

                className="cursor-pointer px-4 py-2  hover:bg-gray-100"
              >
                Download Payslip
              </li>



            </ul>
          </div>

        )}


      </div>
    )
  }


  return (
    <section className="w-full px-6 py-6 bg-gray-50 min-h-screen">
      {/* ---------------- TOP ACTION BAR ---------------- */}
      <div className="mb-6 flex flex-col gap-10 sm:flex-row sm:items-center">
        <button
          onClick={() => handleRunPayroll()}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors sm:w-auto cursor-pointer"
        >
          {processingPayroll ? 'Processing...' : 'Run Payroll'}
        </button>
        <button
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors sm:w-auto cursor-pointer"
        >
          Payroll History
        </button>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:grid-cols-4 md:gap-10 mb-6">
        <SummaryCard
          label="Total Payroll this Month"
          value={totalPayroll.toLocaleString()}
        />
        <SummaryCard
          label="Employees Paid"
          value={payrolls.length.toString()}
        />
        <SummaryCard
          label="Total Deductions"
          value={totalDeductions.toLocaleString()}
        />
        <SummaryCard
          label="Net Payroll Amount"
          value={totalNet.toLocaleString()}
        />



      </div>

      <div className="flex flex-col-reverse w-full md:flex-row gap-3 mb-4 items-center justify-between">
        {/* Search */}
        <div className="flex w-full items-center flex-1 rounded-xl bg-gray-100 px-3 py-2">
          <HiSearch className="text-gray-500" size={32} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent px-2 py-1 outline-none text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className='flex gap-2 items-center'>
          <h1>Filter by Status</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="ready">Ready</option>
            <option value="onhold">Onhold</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>


      {/* mobile card */}
      <div className="space-y-4 md:hidden">
        {filteredPayrolls.slice(0, 4).map((p) => (
          <div
            key={p.id}
            className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
          >

            <div className="flex items-center justify-between">
              <p className="text-md font-semibold text-gray-700 mb-1">
                {new Date(p.created_at).toLocaleDateString()}
              </p>
              <ActionMenu payroll={p} />
            </div>

            <hr />

            {/* Name */}
            <div className="flex items-center justify-between">
              <p className="text-md font-semibold text-gray-700 mb-1"> Name</p>
              <p className="text-base font-semibold text-gray-900">
                {p.employee?.name}
              </p>
            </div>

            {/* Category */}
            <div className="flex items-center justify-between">
              <p className="text-md font-semibold text-gray-700 mb-1">Role</p>
              <p className="font-medium text-gray-800">
                {p.role || '—'}
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <p className="text-md font-semibold text-gray-700 mb-1">Base Salary</p>
              <p className="font-medium text-gray-800">
                ₦{Number(p.base_salary).toLocaleString()}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <p className="text-md font-semibold text-gray-700 mb-1"> Dedution</p>
              <p className="font-semibold text-gray-900">
                ₦{Number(p.deduction).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-md font-semibold text-gray-700 mb-1"> Net Pay</p>
              <p className="font-semibold text-gray-900">
                ₦{Number(p.net_salary).toLocaleString()}
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <p className="text-md font-semibold text-gray-700 mb-1">Status</p>
              {p.status === 'paid' ? (
                <p className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  Paid
                </p>
              ) : p.status === 'ready' ? (
                <p className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                  Ready
                </p>
              ) : p.status === 'onhold' ? (
                <p className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  On Hold
                </p>
              ) : p.status === 'approved' ? (
                <p className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                  Approved
                </p>
              ) : (
                <p className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                  {p.status}
                </p>
              )}


            </div>
          </div>
        ))}
        {!loading && filteredPayrolls.length === 0 && (
          <div className="rounded-xl bg-white p-4 shadow-sm border">
            <p>
              No payroll records found for this period or filter.

            </p>
          </div>
        )}
      </div>


      {/* ----------------  TABLE ---------------- */}
      <div className="hidden md:block rounded-xl bg-white shadow-sm overflow-x-auto">

        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Base Salary</th>
                <th className="px-4 py-3 text-left font-medium">Deductions</th>
                <th className="px-4 py-3 text-left font-medium">Net Pay</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center">
                    No payroll records found
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((pay) => (
                  <tr key={pay.id}>
                    <td className="px-4 py-3">
                      {new Date(pay.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">
                      {pay.employee?.name}
                    </td>

                    <td className="px-4 py-3">{pay.role}</td>

                    <td className="px-4 py-3">
                      {Number(pay.base_salary).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      {Number(pay.deduction).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-semibold text-green-600">
                      {Number(pay.net_salary).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 capitalize">
                      {pay.status}
                    </td>

                    <td className="px-4 py-3">
                      <ActionMenu />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>





    </section>
  )
}



function SummaryCard({
  label,
  value,

}: {
  label: string
  value: string

}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="flex items-center justify-between">
        <p className="mt-2 text-2xl font-bold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  )
}