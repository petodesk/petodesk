
import inventoryImg from '../assets/inventoryimg.png'
import salesImg from '../assets/salesimg.png'
import invoiceImg from '../assets/invoiceimg.png'
import reportImg from '../assets/reportimg.png'
import FeatureSection from './FeatureSection'

export default function BusinessCard() {
  return (
    <>
      <FeatureSection
        title="Inventory Management"
        description="Keep your products and stock under control in real time."
        features={[
          'Add, update, and track stock',
          'Low-stock alerts',
          'Multi-warehouse support',
          'Product variants (size, color, etc.)',
          "Search and filter items",
          'Export to CSV/PDF',
        ]}
        image={inventoryImg}
        bgColor="bg-yellow-400"
      />

      <FeatureSection
        title="Sales & Expenses"
        description="Monitor daily sales, expenses, and profit."
        features={[
          'Record sales and expenses per user',
          'Track profit/loss by day, week, month',
          'Export reports to Excel/PDF',
        ]}
        image={salesImg}
        reverse
      />

      <FeatureSection
        title="Invoicing & Payouts"
        description="Generate invoices and manage payouts seamlessly."
        features={[
          'Create and email invoices to clients',
          'Track payment status',
          'nternal wallet for business earnings',
          `Bank transfers & withdrawal tracking Transaction history`,
          'Transaction history'
        ]}
        image={invoiceImg}
        bgColor="bg-blue-600 text-white"
      />

      <FeatureSection
        title="Reporting & Analytics"
        description="Turn data into insights to grow your business."
        features={[
          'Profit & loss reports',
          'Inventory stock & turnover reports',
          'Task completion reports',
          'Interactive charts & dashboards',
          'Exportable reports'
        ]}
        image={reportImg}
        reverse
      />
    </>
  )
}
