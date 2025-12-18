"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CardFrame from "../../../_components/CardFrame";
import NoticeModal from "../../../_components/NoticeModal";
import StatusLine from "../../../_components/StatusLine";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams() as { token?: string | string[] };
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "loading" | "error" | "success"; message?: string }>({ kind: "idle" });
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus({ kind: "error", message: "Invalid reset link." });
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
      const res = await fetch(`/api/auth/reset/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data?.success) {
        setStatus({ kind: "idle" });
        setIsSuccessOpen(true);
      } else {
        setStatus({ kind: "error", message: data?.message || "Unable to reset." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Network error" });
    }
  };

  return (
    <main>
      <CardFrame>
        <button
          type="button"
          onClick={() => router.push("/auth?mode=signin")}
          className="absolute left-4 top-4 sm:left-6 sm:top-6 inline-flex items-center gap-1.5 text-black/20 hover:text-black/40 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="text-sm font-medium leading-5">Back</span>
        </button>

        <div className="mx-auto w-96 max-w-full flex flex-col justify-start items-start gap-7 pt-12 sm:pt-0">
          <div className="inline-flex justify-center items-center gap-5">
            <div className="size-11 bg-blue-500 rounded-xl flex items-center justify-center">
              <div className="text-slate-50 text-2xl font-bold leading-10">L</div>
            </div>
            <div className="text-black/20 text-xl font-bold leading-8">Lahap</div>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch text-black text-2xl font-medium leading-8">Set new password</div>
            <div className="self-stretch text-gray-500 text-base font-normal leading-6">
              Enter a new secure password for your account.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <div className="self-stretch text-black text-base font-medium leading-6">Password</div>
              <div className="self-stretch h-12 px-3.5 py-3 bg-slate-200 rounded-xl outline -outline-offset-1 outline-gray-300 flex items-center justify-between">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-500 text-base font-normal leading-6"
                  required
                />
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <div className="self-stretch text-black text-base font-medium leading-6">Confirm password</div>
              <div className="self-stretch h-12 px-3.5 py-3 bg-slate-200 rounded-xl outline -outline-offset-1 outline-gray-300 flex items-center justify-between">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-500 text-base font-normal leading-6"
                  required
                />
              </div>
            </div>

            <div className="self-stretch flex flex-col gap-2">
              <StatusLine kind={status.kind === "error" ? "error" : "info"} message={status.message} />

              <button
                type="submit"
                disabled={status.kind === "loading"}
                className="h-11 px-20 py-2 bg-blue-500 rounded-xl inline-flex justify-center items-center gap-2.5 disabled:bg-blue-300"
              >
                <div className="text-center text-white text-lg font-medium leading-7">
                  {status.kind === "loading" ? "Saving..." : "Reset password"}
                </div>
              </button>
            </div>
          </form>
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
