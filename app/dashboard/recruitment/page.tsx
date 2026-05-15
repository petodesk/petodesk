'use client'

import { useEffect, useState } from "react"
import { HiSearch } from "react-icons/hi"
import { createClient } from "@/app/utils/supabase/client"
import Reports from "@/app/components/Reports"
import { formatDate } from "@/app/utils/dateFormatter"
import CandidateFormModal from "@/app/components/CandidateFormModal"

export default function Recruitment() {
    const supabase = createClient()
    const [addCandidate, setAddCandidate] = useState<boolean>(false)
    const[statusFilter, setStatusFilter] = useState<string>("all")
    const[searchQuery, setSearchQuery] = useState<string>("")
    // Updated stats for Tasks
    const [candidates, setCandidates] = useState<any[]>([])
    const [stats, setStats] = useState({
        applied: 0,
        interview: 0,
        assessment: 0,
        hired: 0,
    })

    useEffect(() => {
        fetchCandidates()

    }, [])

    async function fetchCandidates() {
        const { data, error } = await supabase
            .from("candidates")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) return

        const candidatesData = data || []

        // Stats
        const applied = candidatesData.filter(c => c.status === "applied").length
        const interview = candidatesData.filter(c => c.status === "interview").length
        const assessment = candidatesData.filter(c => c.status === "assessment").length
        const hired = candidatesData.filter(c => c.status === "hired").length

        setCandidates(candidatesData)
        setStats({
            applied,
            interview,
            assessment,
            hired,
        })
    }
    const filteredCandidates = statusFilter ? candidates.filter(c => c.status === statusFilter || statusFilter === "all") : candidates
        candidates.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.toLowerCase().includes(searchQuery.toLowerCase()) || c.position.toLowerCase().includes(searchQuery.toLowerCase()))




    function ActionMenu({ candidate }: { candidate: any }) {
        const [open, setOpen] = useState(false)

        async function updateStatus(newStatus: string) {
            await supabase
                .from("candidates")
                .update({ status: newStatus })
                .eq("id", candidate.id)

            setOpen(false)
            fetchCandidates()
        }

        return (
            <div className="relative">
                <button onClick={() => setOpen(!open)}>⋮</button>

                {open && (
                    <div className="absolute right-0 w-40 bg-white border rounded-lg shadow">
                        <ul className="text-sm">
                            <li onClick={() => updateStatus("applied")} className="p-2 hover:bg-gray-100">Applied</li>
                            <li onClick={() => updateStatus("interview")} className="p-2 hover:bg-gray-100">Interview</li>
                            <li onClick={() => updateStatus("assessment")} className="p-2 hover:bg-gray-100">Assessment</li>
                            <li onClick={() => updateStatus("offer")} className="p-2 hover:bg-gray-100">Offer</li>
                            <li onClick={() => updateStatus("hired")} className="p-2 hover:bg-green-100">Hired</li>
                            <li onClick={() => updateStatus("rejected")} className="p-2 hover:bg-red-100">Rejected</li>
                        </ul>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
          
              
                <div className="w-full max-h-[85vh] overflow-y-auto p-2 md:p-6 rounded-lg shadow-md">
                   
                            <div>


                                <div className="flex flex-col md:flex-row gap-6 md:gap-10 my-4">

                                    <button
                                        className="btn-primary rounded-lg py-3 px-10 text-white"
                                    >
                                        + Create Job
                                    </button>


                                    <button
                                        onClick={() => setAddCandidate(true)}
                                        className="bg-white rounded-lg py-3 px-6 border cursor-pointer">
                                        + Add Candidate
                                    </button>
                                </div>


                                {/* -------- SUMMARY CARDS -------- */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 my-8">
                                    <SummaryCard label="Open Positions" value={"1"} />
                                    <SummaryCard label="Total Applicants" value={candidates.length.toString()} />
                                    <SummaryCard label="Candidates in Interview" value={stats.interview.toString()} />
                                    <SummaryCard label="Hired This Month" value={stats.hired.toString()} />
                                </div>

                                {/* SEARCH */}
                                <div className="flex items-center gap-2 rounded-lg bg-gray-200 md:w-[90%] p-3 my-8">
                                    <HiSearch size={25} className="text-gray-400" />
                                    <input onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search candidates..." className="w-full outline-none bg-transparent" />
                                </div>
                               {/* FILTER BY */}
                                <div className="hidden md:flex flex-col gap-2  mb-4 w-full">

                                    <h1 className="text-md font-semibold text-gray-900">Filter by:</h1>
                                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-7 gap-5">
                                          <button 
                                            className={`px-4 py-2 cursor-pointer  rounded-lg text-sm ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
                                            onClick={() => setStatusFilter('all')}
                                        >
                                            All
                                        </button>
                                        <button 
                                            className={`px-4 py-2 cursor-pointer  rounded-lg text-sm ${statusFilter === 'applied' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
                                            onClick={() => setStatusFilter('applied')}
                                        >
                                            Applied
                                        </button>
                                        <button 
                                            className={`px-4 py-2 cursor-pointer  rounded-lg text-sm ${statusFilter === 'interview' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
                                            onClick={() => setStatusFilter('interview')}
                                        >
                                            Interview
                                        </button>
                                        <button 
                                            className={`px-4 py-2 cursor-pointer  rounded-lg text-sm ${statusFilter === 'assessment' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
                                            onClick={() => setStatusFilter('assessment')}
                                        >
                                            Assessment
                                        </button>
                                        <button 
                                            className={`px-4 py-2 cursor-pointer  rounded-lg text-sm ${statusFilter === 'offer' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
                                            onClick={() => setStatusFilter('offer')}
                                        >
                                            Offer
                                        </button>
                                        <button 
                                            className={`px-4 py-2 cursor-pointer  rounded-lg text-sm ${statusFilter === 'hired' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
                                            onClick={() => setStatusFilter('hired')}
                                        >
                                            Hired
                                        </button>
                                        <button 
                                            className={`px-4 py-2 cursor-pointer  rounded-lg text-sm ${statusFilter === 'rejected' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
                                            onClick={() => setStatusFilter('rejected')}
                                        >
                                            Rejected
                                        </button>
                                    </div>
                                </div>
                                 <div className="md:hidden flex gap-2 items-center mb-4">
                                    
                                    <h1>Filter by:</h1>
                                    <select
                                    onChange={(e)=>setStatusFilter(e.target.value)}
                                     name="" id="" className="bg-white border rounded-lg py-2 px-4">
                                        <option value="">All</option>
                                        <option value="applied">Applied</option>
                                        <option value="interview">Interview</option>
                                        <option value="assessment">Assessment</option>
                                        <option value="offer">Offer</option>
                                        <option value="hired">Hired</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>


                                {/* TABLE */}
                                <div>
                                    <h1 className="font-semibold mb-4">Candidate Details</h1>
                                </div>

                                {/* -------- MOBILE CARDS -------- */}
                                <div className="space-y-4 md:hidden">
                                    {filteredCandidates.map((c) => (
                                        <div key={c.id} className="rounded-xl bg-white p-4 shadow-sm border space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-md font-semibold text-gray-700">
                                                    {formatDate(c.created_at)}
                                                </p>
                                                <ActionMenu candidate={c} />
                                            </div>
                                            <hr />

                                            <InfoRow label="Name" value={c.name} />
                                            <InfoRow label="Email" value={c.email} />
                                            <InfoRow label="Phone" value={c.phone} />
                                            <InfoRow label="Position" value={c.position} />
                                            <InfoRow label="Experience" value={c.experience} />
                                            <InfoRow label="Status" value={c.status} />
                                        </div>
                                    ))}

                                </div>

                                {/* -------- DESKTOP TABLE -------- */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Added Date</th>
                                                <th className="px-4 py-3 text-left">Name</th>
                                                <th className="px-4 py-3 text-left"> Email</th>
                                                <th className="px-4 py-3 text-left">Phone</th>
                                                <th className="px-4 py-3 text-left">Role</th>
                                                <th className="px-4 py-3 text-left">Status</th>
                                                <th className="px-4 py-3 text-left">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCandidates.map((c) => (
                                                <tr key={c.id} className="border-t hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {formatDate(c.created_at)}
                                                    </td>
                                                    <td className="px-4 py-3">{c.name}</td>
                                                    <td className="px-4 py-3">{c.email}</td>
                                                    <td className="px-4 py-3">{c.phone}</td>
                                                    <td className="px-4 py-3">{c.position}</td>
                                                    <td className="px-4 py-3">
                                                        <span className=" capitalize px-2 py-1 rounded text-xs bg-gray-100">
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <ActionMenu candidate={c} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                   
                                </div>
                                 {filteredCandidates.length === 0 && (
                                        <p className="text-center text-gray-500 py-10">No candidates found. </p>
                                    )}

                                {addCandidate && (
                                    <CandidateFormModal
                                        open={addCandidate}
                                        onClose={() => {
                                            setAddCandidate(false);
                                            fetchCandidates();
                                        }}
                                    />
                                )}
                            </div>
                  

                </div>
        
        </>
    )
}

function SummaryCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-1 py-2 shadow-sm ">
            <p className="text-sm capitalize tracking-wider">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
        </div>
    )
}

function InfoRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex justify-between items-center border-b border-green-400 pb-2">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium">{value || "-"}</span>
        </div>
    )
}