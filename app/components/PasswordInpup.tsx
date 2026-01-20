import { FaEye, FaEyeSlash } from "react-icons/fa"

export  default function PasswordInput({
    label,
    show,
    toggle,
}: {
    label: string
    show: boolean
    toggle: () => void
}) {
    return (
        <div>
            <label className="text-md font-semibold text-gray-600 block mb-1">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    className="p-3 rounded-lg border border-gray-300 w-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"

                />
                <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                >
                    {show ?<FaEye /> :  <FaEyeSlash />}
                </button>
            </div>
        </div>
    )
}