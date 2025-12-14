"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Step = "email" | "verify" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep("verify");
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.every(c => c !== "")) {
      setStep("reset");
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && confirmPassword && password === confirmPassword) {
      router.push("/auth?mode=signin");
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-200 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-lg">
        {/* Back Button */}
        <button
          onClick={() => router.push("/auth")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors mb-6 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Logo */}
        <div className="flex items-center gap-4 mb-8">
          <div className="size-14 rounded-2xl overflow-hidden">
            <Image src="/images/icon/logo.png" alt="Lahap Logo" width={56} height={56} className="w-full h-full object-contain" />
          </div>
          <div className="text-black text-2xl font-bold">Lahap</div>
        </div>

        {/* Email Step */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-black">Forget password</h1>
              <p className="text-sm text-gray-500">
                Enter the email associated with your account. We&apos;ll send you a verification code to reset your password.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-base font-medium text-black">Your email</label>
              <div className="h-12 rounded-xl bg-slate-200 px-3.5 py-3 border border-gray-300 flex items-center justify-between">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter your email"
                  className="flex-1 bg-transparent text-gray-500 text-base font-normal outline-none"
                  required
                />
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center justify-center"
            >
              <span className="text-white text-lg font-medium">Send code</span>
            </button>
          </form>
        )}

        {/* Verify Code Step */}
        {step === "verify" && (
          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-black">Verify Your Code</h1>
              <p className="text-sm text-gray-500">
                We&apos;ve sent a 6-digit verification code to your email. Please enter it below to continue resetting your password.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-base font-medium text-black">Enter 6-digit code</label>
              <div className="flex items-center gap-2">
                {code.slice(0, 3).map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-semibold rounded-xl bg-slate-200 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                ))}
                <span className="text-gray-400 text-2xl">—</span>
                {code.slice(3, 6).map((digit, index) => (
                  <input
                    key={index + 3}
                    id={`code-${index + 3}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index + 3, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-semibold rounded-xl bg-slate-200 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex-1 h-12 rounded-xl bg-white border border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer inline-flex items-center justify-center"
              >
                <span className="text-blue-500 text-base font-medium">Resend code</span>
              </button>
              <button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center justify-center"
              >
                <span className="text-white text-base font-medium">Send code</span>
              </button>
            </div>
          </form>
        )}

        {/* Reset Password Step */}
        {step === "reset" && (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-black">Set new password</h1>
              <p className="text-sm text-gray-500">
                Set a new password for your account. Make sure it&apos;s strong and easy for you to remember.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-base font-medium text-black">Create a password</label>
                <div className="h-12 rounded-xl bg-slate-200 px-3.5 py-3 border border-gray-300 flex items-center justify-between">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password must be 8 character"
                    className="flex-1 bg-transparent text-gray-500 text-base font-normal outline-none"
                    required
                    minLength={8}
                  />
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium text-black">Confirm password</label>
                <div className="h-12 rounded-xl bg-slate-200 px-3.5 py-3 border border-gray-300 flex items-center justify-between">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="flex-1 bg-transparent text-gray-500 text-base font-normal outline-none"
                    required
                  />
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center justify-center"
            >
              <span className="text-white text-lg font-medium">Send code</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
