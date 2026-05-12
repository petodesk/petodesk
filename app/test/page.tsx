export default function OgPreviewPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
            <div
                className="w-full max-w-[1200px] h-[630px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
                <div className="flex h-full justify-between items-center px-16 py-14">

                    {/* LEFT SIDE */}
                    <div className="flex flex-col w-[60%]">

                        {/* Logo */}
                        <div className="flex items-center mb-8">
                            <img
                                src="/logo.svg"
                                alt="PetoDesk"
                                className="w-14 h-14 object-contain"
                            />

                            <h1 className="text-5xl font-bold text-blue-600 ml-4">
                                PetoDesk
                            </h1>
                        </div>

                        {/* Heading */}
                        <div className="space-y-2">
                            <h2 className="text-6xl font-extrabold leading-tight text-blue-600">
                                Manage Your Business and Team
                            </h2>

                            <h2 className="text-6xl font-extrabold leading-tight text-gray-900">
                                Smarter All in One Platform
                            </h2>
                        </div>

                        {/* Description */}
                        <p className="mt-8 text-[24px] leading-relaxed text-gray-600">
                            Track your sales effortlessly, manage inventory in real time,
                            oversee your staff and their tasks, run payroll with ease,
                            handle HR operations seamlessly, and make smarter business
                            decisions all from one secure platform.
                        </p>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="relative flex items-center justify-center w-[35%] h-full">

                    
                        {/* Phone */}
                        <img
                            src="/on-phone-1.png"
                            alt="Phone Preview"
                            className="h-[520px] object-contain drop-shadow-2xl"
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}