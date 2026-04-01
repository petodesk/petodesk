
'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { createClient } from '@/app/utils/supabase/client'
import { AddSaleModal } from '@/app/components/SellerForm'
import ReceiptModal from '@/app/components/ReceiptModal'
import AllSalesModal from '@/app/components/AllSalesModal'
import { HiSearch } from 'react-icons/hi'
import CameraScanner from '@/app/components/CameraScanner'
import { useCompany } from '@/app/context/CompanyContext'
import { formatDate } from '@/app/utils/dateFormatter'

type Range =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'

type Sale = {
  id: string
  sold_by:string
  total_amount: number
  payment_method: string
  created_at: string

  profiles: {
    full_name: string
  } | null

  sale_items: {
    id: string
    quantity: number
    status: string
    subtotal: number
    selling_price: number
    cost_price: number
    discount: number
    discount_percent: number
    tax_percent: number
    tax_amount: number
    product_id: string
    products: {
      name: string
    } | null

  }[]

}
type Status = 'all' | 'Sold' | 'Cancelled'


export default function SellPage() {
  const supabase = createClient()
  const { company, currency } = useCompany()

  const [range, setRange] = useState<Range>('this_month')
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [allSalesOpen, setAllSalesOpen] = useState(false)

  //  Receipt modal state
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<Status>('all')

  const [show, setShow] = useState(true)
  const [totalSales, setTotalSales] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [edit, setEdit] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [sellerCompanyId, setSellerCompanyId] = useState<string | null>(null)
  const[role,setRole] = useState()
  /* ---------------- DATE RANGE LOGIC ---------------- */
  const getRangeDates = (range: Range) => {
    const now = new Date()
    let from = new Date()
    let to = new Date()

    switch (range) {
      case 'today':
        from.setHours(0, 0, 0, 0)
        break

      case 'yesterday':
        from.setDate(from.getDate() - 1)
        from.setHours(0, 0, 0, 0)
        to = new Date(from)
        to.setHours(23, 59, 59, 999)
        break

      case 'this_week':
        from.setDate(from.getDate() - from.getDay())
        from.setHours(0, 0, 0, 0)
        break

      case 'last_week':
        from.setDate(from.getDate() - from.getDay() - 7)
        from.setHours(0, 0, 0, 0)
        to = new Date(from)
        to.setDate(to.getDate() + 6)
        to.setHours(23, 59, 59, 999)
        break

      case 'this_month':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        break

      case 'last_month':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        to = new Date(now.getFullYear(), now.getMonth(), 0)
        to.setHours(23, 59, 59, 999)
        break

      case 'this_year':
        from = new Date(now.getFullYear(), 0, 1)
        break

      case 'last_year':
        from = new Date(now.getFullYear() - 1, 0, 1)
        to = new Date(now.getFullYear() - 1, 11, 31)
        to.setHours(23, 59, 59, 999)
        break
    }

    return { from, to }
  }

  /* ---------------- FETCH SALES ---------------- */
  const fetchSales = useCallback(async () => {
    setLoading(true)

    const { from, to } = getRangeDates(range)

    const { data, error } = await supabase
      .from('sales')
      .select(`
    id,
    sold_by,
    total_amount,
    payment_method,
    created_at,
    profiles(full_name ),
    sale_items (
  id,
  quantity,
  status,
  subtotal,
  selling_price,
  discount_percent,
  tax_percent,  
  tax_amount, 
  cost_price,
  discount,
  product_id,
  products(name )
)

  `)
      .eq('company_id', sellerCompanyId)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: false })


    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    let salesTotal = 0
    let profitTotal = 0

    data.forEach((sale) => {
      const activeItems = sale.sale_items.filter(
        item => item.status !== 'Cancelled'
      )

      activeItems.forEach(item => {
        salesTotal += item.subtotal
        profitTotal +=
          (item.selling_price - item.cost_price) *
          item.quantity -
          item.discount
      })
    })



    setSales(data as [])
    setTotalSales(salesTotal)
    setTotalProfit(profitTotal)
    setTotalTransactions(data.length)
    setLoading(false)
  }, [range, supabase])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])
console.log(sales)

  useEffect(() => {
    const fetchCompany = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', userData.user.id)
        .single()
  

      setSellerCompanyId(profile?.company_id || null)
      setRole(profile?.role)
    
    }

    fetchCompany()
  }, [])

  const handleModalClose = () => {
    setOpenModal(false)
    fetchSales()
  }

  const filteredSales = sales.filter((sale) => {
    const query = search.trim().toLowerCase()

    /* ---------- SEARCH FILTER ---------- */
    const searchMatch =
      query === '' ||
      sale.sale_items.some(
        (item) =>
          item.products?.name?.toLowerCase().includes(query)
      ) ||
      sale.profiles?.full_name?.toLowerCase().includes(query)

    /* ---------- STATUS FILTER ---------- */
    const statusMatch =
      filterStatus === 'all' ||
      sale.sale_items.some(
        (item) => item.status === filterStatus
      )

    return searchMatch && statusMatch
  })

  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState(1)

  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty < 1) return; // Prevent 0 or negative
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity: newQty } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Calculate Totals for the Cart UI
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.selling_price * item.quantity), 0);
  const cartTax = cart.reduce((acc, item) => {
    const itemTotal = item.selling_price * item.quantity;
    return acc + (itemTotal * (item.tax_percent / 100));
  }, 0);

  const cartTotal = cartSubtotal + cartTax;

  const handleBarcodeScan = async (code: string) => {
    if (!code) return;

    const { data: product, error } = await supabase
      .from('products')
      .select(`
      id,
      name,
      barcode,
      product_prices (selling_price, cost_price),
      product_stock (quantity)
    `)
      .eq('barcode', code)
      .single();

    if (error || !product) {
      alert('Product not found: ' + code);
      return;
    }

    const stockAvailable = product.product_stock?.[0]?.quantity || 0;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      // Check if we are trying to add more than available stock
      const currentQtyInCart = existing ? existing.quantity : 0;
      if (currentQtyInCart + 1 > stockAvailable) {
        alert(`Insufficient stock for ${product.name}. Only ${stockAvailable} left.`);
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prev, {
        id: product.id,
        name: product.name,
        selling_price: product.product_prices?.[0]?.selling_price || 0,
        cost_price: product.product_prices?.[0]?.cost_price || 0,
        tax_percent: 0,
        quantity: 1,
        discount_percent: 0,
      }];
    });

    // Optional: Add a brief "Beep" sound or haptic feedback here
    setIsCartOpen(true);
  };



 const handleCheckout = async (paymentMethod: string) => {
  if (cart.length === 0) return;
  if (!confirm(`Complete sale of ₦${cartTotal.toLocaleString()}?`)) return;

  setIsCheckoutLoading(true);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Create the Main Sale Record
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        total_amount: cartTotal,
        payment_method: paymentMethod,
        sold_by: user?.id,
        company_id: sellerCompanyId
      }])
      .select().single();

    if (saleError) throw saleError;

    // 2. Prepare Items for Bulk Insert
    const saleItems = cart.map((item) => {
      const subtotal = (item.selling_price * item.quantity);
      const taxAmount = subtotal * (item.tax_percent / 100);
      const discountAmount = subtotal * (item.discount_percent / 100);
      
      return {
        sale_id: sale.id,
        product_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        selling_price: item.selling_price,
        cost_price: item.cost_price,
        discount_percent: item.discount_percent,
        discount:discountAmount,
        tax_percent: item.tax_percent,
        tax_amount: taxAmount,
        subtotal: subtotal + taxAmount,
        status: 'Sold'
      };
    });

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
    if (itemsError) throw itemsError;

    // 3. Update Stock (Better to do this via a single RPC call if possible, 
    // but for now, we'll loop)
    for (const item of cart) {
        const { data: currentStock } = await supabase
            .from('product_stock')
            .select('quantity')
            .eq('product_id', item.id)
            .single();

        await supabase
            .from('product_stock')
            .update({ quantity: (currentStock?.quantity || 0) - item.quantity })
            .eq('product_id', item.id);
    }

    alert('Sale Completed Successfully!');
    setCart([]);
    setIsCartOpen(false);
    fetchSales();
  } catch (err: any) {
    alert('Error: ' + err.message);
  } finally {
    setIsCheckoutLoading(false);
  }
};



  function ActionMenu({ sale, item, rowId }: any) {

    const supabase = createClient()
    const [open, setOpen] = useState(false)

    const startEdit = () => {
      setEditingItemId(rowId)
      setEditQty(item.quantity)
      setOpen(false)
    }




    const saveEdit = async () => {
      if (editQty === item.quantity) {
        setEditingItemId(null)
        return
      }

      const diff = editQty - item.quantity
      const price = item.selling_price

      /* ---------- OLD VALUES ---------- */
      const grossOld = price * item.quantity
      const discountOld = (grossOld * item.discount_percent) / 100
      const netOld = grossOld - discountOld
      const taxOld = (netOld * item.tax_percent) / 100
      const oldSubtotal = netOld + taxOld

      /* ---------- NEW VALUES ---------- */
      const grossNew = price * editQty
      const discountNew = (grossNew * item.discount_percent) / 100
      const netNew = grossNew - discountNew
      const taxNew = (netNew * item.tax_percent) / 100
      const newSubtotal = netNew + taxNew

      /* ---------- STOCK CHECK ---------- */
      const { data: stockRow, error } = await supabase
        .from('product_stock')
        .select('quantity')
        .eq('product_id', item.product_id)
        .single()

      if (error || !stockRow) {
        alert('Failed to update stock')
        return
      }

      if (diff > 0 && stockRow.quantity < diff) {
        alert('Not enough stock available')
        return
      }

      await supabase
        .from('product_stock')
        .update({
          quantity: stockRow.quantity - diff,
        })
        .eq('product_id', item.product_id)

      /* ---------- UPDATE SALE ITEM ---------- */
      await supabase
        .from('sale_items')
        .update({
          quantity: editQty,
          discount: discountNew,
          tax_amount: taxNew,
          subtotal: newSubtotal,
        })
        .eq('id', item.id)

      /* ---------- UPDATE SALE TOTAL ---------- */
      await supabase
        .from('sales')
        .update({
          total_amount: sale.total_amount - oldSubtotal + newSubtotal,
        })
        .eq('id', sale.id)

      setEditingItemId(null)
      fetchSales()
    }



    const handleCancelItem = async () => {
      if (item.status === 'cancelled') {
        alert('Item already cancelled')
        return
      }

      if (!confirm('Cancel this item and return stock?')) return

      /* 1️⃣ Mark item cancelled */
      await supabase
        .from('sale_items')
        .update({ status: 'Cancelled' })
        .eq('id', item.id)

      /* 2️⃣ Restore stock */
      const { data: stock } = await supabase
        .from('product_stock')
        .select('quantity')
        .eq('product_id', item.product_id)
        .single()

      await supabase
        .from('product_stock')
        .update({
          quantity: stock?.quantity + item.quantity,
        })
        .eq('product_id', item.product_id)

      /* 3️⃣ Recalculate sale total */
      const remainingItems = sale.sale_items.filter(
        (i: any) => i.id !== item.id && i.status !== 'cancelled'
      )

      const newTotal = remainingItems.reduce((sum: any, i: any) => {
        const gross = i.selling_price * i.quantity
        const discount = (gross * i.discount_percent) / 100
        const net = gross - discount
        const tax = (net * i.tax_percent) / 100
        return sum + net + tax
      }, 0)


      await supabase
        .from('sales')
        .update({
          total_amount: newTotal,
        })
        .eq('id', sale.id)

      fetchSales()
    }




    const openReceipt = () => {
      setSelectedSale(sale)
      setReceiptOpen(true)
      setOpen(false)
    }





    return (
      <div className="relative">
        <button
          className='font-bold w-4 cursor-pointer'
          onClick={() => setOpen(!open)}>⋮</button>

        {open && (
          <div className="absolute right-0 z-20 w-40 rounded-lg border bg-white shadow-lg">
            <ul className="text-sm">
              {item.status !== 'Cancelled' && (
                editingItemId === rowId ? (
                  <li onClick={saveEdit} className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                    Save
                  </li>
                ) : (
                  <li onClick={startEdit} className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                    Edit Qty
                  </li>
                )
              )}


              {item.status !== 'Cancelled' && (
                <li
                  onClick={handleCancelItem}
                  className="px-4 py-2 cursor-pointer text-red-600 hover:bg-gray-100"
                >
                  Cancel
                </li>
              )}

              <li
                onClick={openReceipt}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                Receipt
              </li>

            </ul>
          </div>
        )}

      </div>
    )
  }



  /* ---------------- UI ---------------- */
  return (
    <section className="w-full px-6 py-6 bg-gray-50">

      {/* ---------------- TOP ACTION BAR ---------------- */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Left: Add Sale */}
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto"
        >
          + Add New Sell
        </button>

        <button
          onClick={() => setScannerOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto"
        >
          Scan Barcode
        </button>

        {scannerOpen && (
          <div className="fixed inset-0 z-[70] bg-black flex flex-col">
            {/* Header for Scanner */}
            <div className="p-4 flex justify-between items-center text-white bg-blue-600">
              <h2 className="font-bold">Scanning Items... ({cart.length} in cart)</h2>
              <button
                onClick={() => setScannerOpen(false)}
                className="px-4 py-2 bg-red-500 rounded-lg"
              >
                Done Scanning
              </button>
            </div>

            <CameraScanner
              onScan={(code) => {
                handleBarcodeScan(code);
                // Notice we DON'T close the scanner here anymore
              }}
              onClose={() => setScannerOpen(false)}
            />

            {/* Mini Cart Preview inside Scanner */}
            <div className="absolute bottom-10 left-0 right-0 px-4">
              <div className="bg-white/90 p-3 rounded-t-xl text-center font-bold text-blue-800">
                Last Scanned: {cart[cart.length - 1]?.name || 'None'}
              </div>
            </div>
          </div>
        )}
        {/* Right: Range Selector */}
        <div className='flex gap-2 items-center'>
          <h1>Filter by Time:</h1>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-48"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="last_year">Last Year</option>
          </select>
        </div>
      </div>


      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          label="Total Sales"
          value={`${currency} ${totalSales.toLocaleString()}`}
          show={show}
          onToggle={() => setShow(!show)}
        />
{
  role === 'owner' && (
 <SummaryCard
          label="Total Profit"
          value={`${currency} ${totalProfit.toLocaleString()}`}
          show={show}
          onToggle={() => setShow(!show)}
        />
  )
}
       

        <div className="flex flex-row md:flex-col justify-between items-center rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="mt-2 text-xl font-semibold">
            {loading ? '…' : totalTransactions}
          </p>
        </div>



      </div>


      <div className="flex flex-col-reverse w-full md:flex-row gap-3 mb-4 items-center justify-between">
        {/* Search */}
        <div className="flex w-full items-center flex-1 rounded-xl bg-gray-100 px-3 py-2">
          <HiSearch className="text-gray-500" size={22} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tilte or category"
            className="w-full bg-transparent px-2  outline-none text-sm"
          />
        </div>

        {/* status Filter */}
        <div className='flex gap-2 items-center'>
          <h1>Filter by Status</h1>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Status)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="Sold">Sold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      {/* ---------------- TRANSACTION TABLE ---------------- */}
      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b px-4 py-3 text-sm font-medium flex justify-between">
          <span>
            Transaction History
            <span className="ml-2 text-gray-400 capitalize">
              ({range.replace('_', ' ')})
            </span>
          </span>
        </div>
        {/* ---------------- MOBILE SALES CARDS ---------------- */}
        <div className="space-y-4 md:hidden">
          {!loading &&
            filteredSales.slice(0, 5).flatMap((sale) =>
              sale.sale_items.map((item) => {
                const amount =
                  item.subtotal

                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-600">
                        {formatDate(sale.created_at)}
                      </p>
                      <ActionMenu
                        sale={sale}
                        item={item}
                        rowId={item.id}
                      />
                    </div>

                    <hr />

                    {/* Product Name */}
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-600">
                        Product
                      </span>
                      <span className="font-medium text-gray-900">
                        {item.products?.name}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">
                        Quantity
                      </span>

                      {editingItemId === item.id ? (
                        <input
                          type="number"
                          min={1}
                          value={editQty}
                          onChange={(e) => setEditQty(+e.target.value)}
                          className="w-20 rounded border px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">
                          {item.quantity}
                        </span>
                      )}
                    </div>

                    {/* Selling Price */}
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-600">
                        Selling Price
                      </span>
                      <span className="font-semibold text-gray-900">
                        {currency} {item.selling_price.toLocaleString()}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-600">
                        Amount
                      </span>
                      <span className="font-semibold text-gray-900">
                        {currency} {amount.toLocaleString()}
                      </span>
                    </div>

                    {/* Sold By */}
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-600">
                        Sold By
                      </span>
                      <span className="text-gray-800">
                        {sale.profiles?.full_name ?? 'Unknown'}

                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">
                        Status
                      </span>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold
                  ${item.status === 'Cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                )
              })
            )}

          {!loading && sales.length === 0 && (
            <div className="text-center text-gray-400 py-10">
              No transactions for this period.
            </div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Selling Price</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Sold By</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-2 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                filteredSales.slice(0, 5).flatMap((sale) =>
                  sale.sale_items.map((item, index) => {
                    const amount =
                      item.subtotal

                    return (
                      <tr
                        key={`${sale.id}-${index}`}
                        className="border-t"
                      >
                        <td className="px-4 py-3">
                          {formatDate(sale.created_at)}
                        </td>

                        <td className="px-4 py-3">
                          {item.products?.name
                          }
                        </td>

                        <td className="px-4 py-3">
                          {editingItemId === item.id ? (
                            <input
                              type="number"
                              min={1}
                              value={editQty}
                              onChange={(e) => setEditQty(+e.target.value)}
                              className="w-16 rounded border px-2 py-1 text-sm"
                            />
                          ) : (
                            item.quantity
                          )}

                        </td>





                        <td className="px-4 py-3">{item.selling_price}</td>

                        <td className="px-4 py-3">
                          {currency} {amount.toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          {sale.profiles?.full_name
                          }
                        </td>

                        <td
                          className={`px-4 py-3 font-medium ${item.status === 'Cancelled'
                            ? 'text-red-500'
                            : 'text-blue-600'
                            }`}
                        >
                          {item.status}
                        </td>
                        <td className="px-4 py-3">
                          <ActionMenu
                            sale={sale}
                            item={item}
                            rowId={item.id}
                          />

                        </td>
                      </tr>
                    )
                  })
                )}

              {!loading && sales.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No transactions for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <AddSaleModal open={openModal} onClose={handleModalClose} />
        {receiptOpen && selectedSale && company && (
          <ReceiptModal
            open={receiptOpen}
            onClose={() => setReceiptOpen(false)}
            sale={selectedSale}
            company={company}
          />
        )}
        {allSalesOpen && (
          <AllSalesModal
            open={allSalesOpen}
            onClose={() => setAllSalesOpen(false)}
            sales={sales}
            ActionMenu={ActionMenu}
            editingItemId={editingItemId}
            editQty={editQty}
            editOpen={edit}
            loading={loading}
            setEditQty={setEditQty}

          />
        )}


      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setAllSalesOpen(true)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          See all sales
        </button>
      </div>

      {/* --- CART SIDEBAR --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/50 mt-30">
          <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
              <h2 className="text-lg font-bold">Current Sale ({cart.length})</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-2xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">Cart is empty. Scan something!</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">₦{item.selling_price.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity - 1)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200">-</button>
                        <span className="px-3 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity + 1)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200">+</button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700">🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            <div className="p-4 bg-gray-50 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₦{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (0%):</span>
                <span>₦{cartTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-blue-600">₦{cartTotal.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  disabled={cart.length === 0}
                  onClick={() => handleCheckout('Cash')}
                  className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300"
                >
                  Cash Sale
                </button>
                <button
                  disabled={cart.length === 0}
                  onClick={() => handleCheckout('Transfer')}
                  className="bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  )


  /* ---------------- SUMMARY CARD ---------------- */
  function SummaryCard({
    label,
    value,
    show,
    onToggle,
  }: {
    label: string
    value: string
    show: boolean
    onToggle: () => void
  }) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex items-center justify-between">
          <p className="mt-2 text-xl font-semibold">
            {show ? value : '••••'}
          </p>
          <button onClick={onToggle}>
            {show ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
      </div>
    )
  }
}
