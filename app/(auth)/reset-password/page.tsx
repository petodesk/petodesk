'use client'
import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import PasswordInput from "@/app/components/PasswordInpup";

export default function ResetPassword() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState("");
   const [passwordError, setPasswordError] = useState('')

    const supabase = createClient();
    const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      alert("Password updated successfully!");
      // Sign them out after reset to force a clean login
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <form onSubmit={handleUpdatePassword} className="p-8 bg-white shadow-lg rounded-lg w-full max-w-md flex flex-col ap-10">
                <h1 className="text-xl font-bold mb-4">Set New Password</h1>

                <PasswordInput
                    label="New Password *"
                    value={password}
                    show={showPassword}
                    toggle={() => setShowPassword(!showPassword)}
                    onChange={(e: any) => setPassword(e.target.value)}
                />

                <PasswordInput
                    label="Confirm Password *"
                    value={confirmPassword}
                    show={showPassword}
                    toggle={() => setShowPassword(!showPassword)}
                    onChange={(e: any) => setConfirmPassword(e.target.value)}
                />
                {passwordError && (
                <p className="text-red-500 text-md">{passwordError}</p>
              )}
                <button
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md my-6"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}