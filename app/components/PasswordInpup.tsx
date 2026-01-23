import { FaEye, FaEyeSlash } from "react-icons/fa"

interface PasswordInputProps {
    label: string
    show: boolean
    toggle: () => void
    value: string 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
}

export default function PasswordInput({
    label,
    show,
    toggle,
    value,
    onChange
}: PasswordInputProps) {
    return (
        <div className="font-poppins">
            <label className="text-md ">
                {label}
            </label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value} 
                    onChange={onChange} 
                    required
                className="w-full p-3 border border-gray-500 rounded-md mt-3"

                />
                <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/3 text-gray-400 cursor-pointer size-5"
                >
                    {show ? <FaEye /> : <FaEyeSlash />}
                </button>
            </div>
        </div>
    )
}