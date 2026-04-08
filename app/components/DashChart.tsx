'use client'

import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area 
} from 'recharts';

// Mock data structure - in your real app, you would format 
// your Supabase data into an array of 12 objects (Jan-Dec)
const data = [
    { name: 'Jan', revenue: 4000, expense: 2400 },
    { name: 'Feb', revenue: 3000, expense: 1398 },
    { name: 'Mar', revenue: 2000, expense: 9800 },
    { name: 'Apr', revenue: 2780, expense: 3908 },
    { name: 'May', revenue: 1890, expense: 4800 },
    { name: 'Jun', revenue: 2390, expense: 3800 },
    { name: 'Jul', revenue: 3490, expense: 4300 },
];

export default function RevenueSummary() {
    return (
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="font-bold text-lg text-gray-700">Revenue Summary</h3>
                    <div className="flex gap-4 mt-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Revenue</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Expense</span>
                        </div>
                    </div>
                </div>
                <select className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg outline-none">
                    <option>This Year</option>
                </select>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#9ca3af'}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#9ca3af'}} 
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        {/* Revenue Line */}
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#2563eb" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRev)" 
                        />
                        {/* Expense Line */}
                        <Area 
                            type="monotone" 
                            dataKey="expense" 
                            stroke="#4ade80" 
                            strokeWidth={3}
                            fill="transparent" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}