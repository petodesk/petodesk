import Header from '@/app/components/Header'
import PricingCard from '@/app/components/PricingCard'

const pricingPlans = [
  {
    title: 'Inventory – Simple Start',
    subtitle: 'Essential tools to track your business',
    features: [
      'Sales tracking',
      'Expense tracking',
      'Inventory management',
      'Basic reports',
      'Invoicing',
      '1 user (Additional users – extra cost)',
    ],
    bestFor: [
      'Small shops',
      'Solo founders',
      'Businesses starting with inventory only',
    ],
  },
  {
    title: 'Simple Start – HR',
    subtitle: 'Core HR tools for small teams',
    features: [
      'Expense tracking',
      'Employee records',
      'Task',
      'Basic reports',
      'Invoicing',
      '1 user (Additional users – extra cost)',
    ],
    bestFor: [
      'Service based businesses',
      'Teams without inventory',
      'Startups managing people first',
    ],
  },
  {
    title: 'Business Plus',
    subtitle: 'Inventory + HR in one platform',
    features: [
      'Simple Start – Inventory',
      'Simple Start – HR',
      'Invoicing',
      '2 users (Additional users – extra cost)',
    ],
    bestFor: [
      'Growing businesses',
'Offices managing products and people',
'Small–medium companies with staff'
    ],
  },
  {
    title: 'Premium',
    subtitle: 'Complete business automation',
    features: [
      'Payroll management',
      'Leave management',
      'Clock-in / clock-out',
      'Recruitment & applicant tracking',
      '5 users (Additional users – extra cost)',
    ],
    bestFor: [
     ` Established companies
Large teams`,
`Multi-department businesses`,
`Companies needing full control
      and insights`
    ],
  },
]

export default function PricingPage() {
  return (
    <>
    <Header/>
    <section className="max-w-8xl mx-auto px-10 py-20 font-poppins bg-gray-50 ">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto py-4">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
          Let’s build the right solution for your business
        </h1>
        <p className="mt-4 text-gray-800">
          Every business is different. That’s why our pricing and setup are tailored to your team size,
workflows, and the modules you need - Inventory, HR, or both.
        </p>
        <p className="mt-2 text-gray-800">
         Our team is here to understand your operations and recommend the best plan for you
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        {pricingPlans.map((plan, index) => (
          <PricingCard key={index} {...plan} />
        ))}
      </div>
    </section>
    </>
  )
}
