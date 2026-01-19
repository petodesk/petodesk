
import inventoryImg from '../assets/inventoryimg.png'
import salesImg from '../assets/salesimg.png'
import invoiceImg from '../assets/invoiceimg.png'
import reportImg from '../assets/reportimg.png'
import FeatureSection from './FeatureSection'
//
import employee from '../assets/employeemg.png'
import recur from '../assets/recu.png'
import leaverq from '../assets/leave req.png'
import analy from '../assets/analytics.png'


export default function HrCard() {


  return (
    <>
      <FeatureSection
        title="Employee Management & Directory"
        description="Keep all employee information and documents organized in one place."
        features={[
          'Employee profiles with role, department, salary, and contact info',
          'Employment documents storage (contracts, certificates, IDs)',
          'E-signature support for contracts, offer letters, and performance documents',
          'Product variants (size, color, etc.)',
          "Disciplinary records and notes",
    
        ]}
        image={employee}
        bgColor="bg-yellow-400"
      />

      <FeatureSection
        title="Recruitment & Onboarding"
        description="Simplify hiring and bring new employees onboard efficiently."
        features={[
          'Job posting and applicant tracking',
'Interview scheduling and candidate notes',
'Convert candidates into employees',
        ]}
        image={recur}
        reverse
      />

      <FeatureSection
        title="Leave & Payroll"
        description="Automate time tracking, leave requests, and payroll."
        features={[
         ' Daily clock-in/out and timesheet tracking',
'Leave requests with approval workflow and balance tracking',
'Payroll calculation: salary, deductions, bonuses',
'Payroll audit trail',
        ]}
        image={leaverq}
        bgColor="bg-blue-600 text-white"
        whiteDot
      />

      <FeatureSection
        title="Performance & Analytics"
        description="Monitor, evaluate, and improve employee performance with actionable insights."
        features={[
         ' Performance goals, evaluations, and appraisal history',
'HR analytics dashboard: attendance trends, turnover, department performance',
'Benefits & allowances management'
        ]}
        image={analy}
        reverse
      />
    </>
  )
}
