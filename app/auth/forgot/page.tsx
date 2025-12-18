"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CardFrame from "../../_components/CardFrame";
import NoticeModal from "../../_components/NoticeModal";
import StatusLine from "../../_components/StatusLine";

type Step = "email" | "verify" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "loading" | "error" | "success"; message?: string }>({
    kind: "idle",
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus({ kind: "loading" });
    try {
      const res = await fetch(`/api/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setStatus({ kind: "error", message: data?.message || "Unable to generate reset code." });
        return;
      }

      const token = String(data.token || "");
      if (!token || token.length < 6) {
        setStatus({ kind: "error", message: "Reset code not available. Please try again." });
        setStep("verify");
        return;
      }

      setResetToken(token);
      setCode(token.slice(0, 6).split(""));
      setStatus({ kind: "success", message: "Reset code generated (email not configured yet)." });
      setStep("verify");
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Network error." });
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = code.join("");
    if (!entered || entered.length !== 6) {
      setStatus({ kind: "error", message: "Please enter the 6-digit code." });
      return;
    }
    if (resetToken && entered !== resetToken) {
      setStatus({ kind: "error", message: "Invalid code." });
      return;
    }
    setStatus({ kind: "idle" });
    setStep("reset");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) {
      setStatus({ kind: "error", message: "Missing reset code. Start again." });
      setStep("email");
      return;
    }
    if (!password || password.length < 8) {
      setStatus({ kind: "error", message: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ kind: "error", message: "Passwords do not match." });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      const res = await fetch(`/api/auth/reset/${resetToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setStatus({ kind: "error", message: data?.message || "Unable to reset password." });
        return;
      }
      setStatus({ kind: "idle" });
      setIsSuccessOpen(true);
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Network error." });
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
    <main>
      <CardFrame>
        <button
          type="button"
          onClick={() => router.push("/auth")}
          className="absolute left-4 top-4 sm:left-6 sm:top-6 inline-flex items-center gap-1.5 text-black/80 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="text-sm font-medium leading-5">Back</span>
        </button>

        <div className="mx-auto w-96 max-w-full flex flex-col justify-start items-start gap-7 pt-12 sm:pt-0">
          <div className="inline-flex justify-center items-center gap-5">
            <div className="size-11 px-3 py-1 bg-blue-500 rounded-xl inline-flex flex-col justify-center items-center">
              <div className="text-slate-50 text-2xl font-bold leading-10">L</div>
            </div>
            <div className="text-black text-xl font-bold leading-8">Lahap</div>
          </div>

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch text-black text-2xl font-medium leading-8">Forgot password</div>
                <div className="self-stretch text-gray-500 text-base font-normal leading-6">
                  Enter the email associated with your account. We&apos;ll generate a reset code (email sending isn&apos;t enabled yet).
                </div>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch text-black text-base font-medium leading-6">Your email</div>
                <div className="self-stretch h-12 px-3.5 py-3 bg-slate-200 rounded-xl outline -outline-offset-1 outline-gray-300 inline-flex justify-between items-center gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="enter your email"
                    className="w-full bg-transparent outline-none text-gray-900 text-base font-normal leading-6 placeholder:text-gray-500"
                    required
                  />
                  <span className="material-symbols-outlined text-xl text-gray-500">mail</span>
                </div>
              </div>

              <button type="submit" className="self-stretch h-11 px-20 py-2 bg-blue-500 rounded-xl inline-flex justify-center items-center gap-2.5">
                <div className="text-center text-white text-lg font-medium leading-7">
                  {status.kind === "loading" ? "Generating..." : "Generate code"}
                </div>
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifySubmit} className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch text-black text-2xl font-medium leading-8">Verify Your Code</div>
                <div className="self-stretch text-gray-500 text-base font-normal leading-6">
                  Enter the 6-digit reset code. Since email isn&apos;t configured yet, the code can be shown here.
                </div>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch text-black text-base font-medium leading-6">Enter 6-digit code</div>
                <div className="flex items-center gap-2">
                  {code.slice(0, 3).map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-semibold text-gray-900 rounded-xl bg-white outline -outline-offset-1 outline-gray-300 focus:outline-blue-500"
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
                      className="w-12 h-14 text-center text-xl font-semibold text-gray-900 rounded-xl bg-white outline -outline-offset-1 outline-gray-300 focus:outline-blue-500"
                    />
                  ))}
                </div>
              </div>

              <div className="self-stretch inline-flex justify-start items-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStatus({ kind: "idle" });
                    setStep("email");
                  }}
                  className="flex-1 h-11 px-8 py-2 rounded-xl outline -outline-offset-1 outline-blue-500 flex justify-center items-center gap-2.5"
                >
                  <div className="text-center text-blue-500 text-lg font-medium leading-7">Back</div>
                </button>
                <button type="submit" className="flex-1 h-11 px-8 py-2 bg-blue-500 rounded-xl flex justify-center items-center gap-2.5">
                  <div className="text-center text-white text-lg font-medium leading-7">Continue</div>
                </button>
              </div>

              {resetToken ? (
                <div className="text-xs text-gray-500">
                  Dev mode: your code is <span className="font-mono">{resetToken}</span>
                </div>
              ) : null}
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch text-black text-2xl font-medium leading-8">Set new password</div>
                <div className="self-stretch text-gray-500 text-base font-normal leading-6">
                  Set a new password for your account. Make sure it&apos;s strong and easy for you to remember.
                </div>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                  <div className="self-stretch text-black text-base font-medium leading-6">Create a password</div>
                  <div className="self-stretch h-12 px-3.5 py-3 bg-slate-200 rounded-xl outline -outline-offset-1 outline-gray-300 inline-flex justify-between items-center gap-3">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password must be 8 character"
                      className="w-full bg-transparent outline-none text-gray-900 text-base font-normal leading-6 placeholder:text-gray-500"
                      required
                      minLength={8}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-gray-500 hover:text-gray-700 transition-colors">
                      <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                  <div className="self-stretch text-black text-base font-medium leading-6">Confirm password</div>
                  <div className="self-stretch h-12 px-3.5 py-3 bg-slate-200 rounded-xl outline -outline-offset-1 outline-gray-300 inline-flex justify-between items-center gap-3">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-transparent outline-none text-gray-900 text-base font-normal leading-6 placeholder:text-gray-500"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-gray-500 hover:text-gray-700 transition-colors">
                      <span className="material-symbols-outlined text-xl">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="self-stretch h-11 px-20 py-2 bg-blue-500 rounded-xl inline-flex justify-center items-center gap-2.5 disabled:bg-blue-300"
                disabled={status.kind === "loading"}
              >
                <div className="text-center text-white text-lg font-medium leading-7">{status.kind === "loading" ? "Saving..." : "Reset password"}</div>
              </button>
            </form>
          )}

          <StatusLine
            kind={status.kind === "error" ? "error" : status.kind === "success" ? "success" : "info"}
            message={status.message}
          />
        </div>
      </CardFrame>

      <NoticeModal
        open={isSuccessOpen}
        title="✅ Password reset"
        description="Your password has been updated. Please sign in again."
        buttonText="Sign in"
        autoCloseMs={1200}
        onClose={() => {
          setIsSuccessOpen(false);
          router.push("/auth?mode=signin");
        }}
      />
    </main>
  );
}
