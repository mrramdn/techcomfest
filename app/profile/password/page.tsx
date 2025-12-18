"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../_components/AppLayout";
import ConfirmModal from "../../_components/ConfirmModal";
import NoticeModal from "../../_components/NoticeModal";
import CardFrame from "../../_components/CardFrame";
import StatusLine from "../../_components/StatusLine";

type ChangePasswordResponse = {
  success: boolean;
  message?: string;
};

export default function ChangePasswordPage() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const onSubmit = async () => {
    setError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = (await res.json()) as ChangePasswordResponse;

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to change password.");
        return;
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsSuccessOpen(true);
    } catch {
      setError("Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout showHeader={false}>
      <CardFrame>
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-black/80 hover:text-black transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="text-sm font-medium leading-5">Back</span>
          </button>

          <div className="mx-auto w-96 max-w-full flex flex-col justify-start items-start gap-7">
            <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
              <div className="self-stretch flex flex-col justify-start items-start gap-6">
                <div className="inline-flex justify-center items-center gap-5">
                  <div className="size-11 px-3 py-1 bg-blue-500 rounded-xl inline-flex flex-col justify-center items-center">
                    <div className="text-slate-50 text-2xl font-bold leading-10">L</div>
                  </div>
                  <div className="text-black text-xl font-bold leading-8">Lahap</div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                  <div className="self-stretch text-black text-2xl font-medium leading-8">Set new password</div>
                  <div className="self-stretch text-gray-500 text-base font-normal leading-6">
                    Set a new password for your account. Make sure it’s strong and easy for you to remember.
                  </div>
                </div>
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="w-full flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch text-black text-base font-medium leading-6">Old password</div>
                <div className="self-stretch h-12 px-3.5 py-3 bg-slate-200 rounded-xl outline outline-offset-1 outline-gray-300 inline-flex justify-between items-center gap-3">
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your old password"
                    className="w-full bg-transparent outline-none text-gray-900 text-base font-normal leading-6 placeholder:text-gray-500"
                  />
                  <button type="button" onClick={() => setShowOld((v) => !v)} className="text-gray-500 h-6">
                    <span className="material-symbols-outlined text-xl">{showOld ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              <div className="w-full flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch text-black text-base font-medium leading-6">Create a password</div>
                <div className="self-stretch h-12 px-3.5 py-3 bg-slate-200 rounded-xl outline outline-offset-1 outline-gray-300 inline-flex justify-between items-center gap-3">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password must be 8 characters"
                    className="w-full bg-transparent outline-none text-gray-900 text-base font-normal leading-6 placeholder:text-gray-500"
                  />
                  <button type="button" onClick={() => setShowNew((v) => !v)} className="text-gray-500 h-6">
                    <span className="material-symbols-outlined text-xl">{showNew ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <div className="w-full flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch text-black text-base font-medium leading-6">Confirm password</div>
                <div className="self-stretch h-12 px-3.5 py-3 bg-slate-200 rounded-xl outline outline-offset-1 outline-gray-300 inline-flex justify-between items-center gap-3">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-transparent outline-none text-gray-900 text-base font-normal leading-6 placeholder:text-gray-500"
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-gray-500 h-6">
                    <span className="material-symbols-outlined text-xl">
                      {showConfirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="self-stretch flex flex-col gap-2">
              <StatusLine kind="error" message={error} />
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setError(null);

                  if (!oldPassword || !newPassword || !confirmPassword) {
                    setError("All fields are required.");
                    return;
                  }
                  if (newPassword.length < 8) {
                    setError("New password must be at least 8 characters.");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setError("Passwords do not match.");
                    return;
                  }

                  setIsConfirmOpen(true);
                }}
                className="h-11 px-20 py-2 bg-blue-500 disabled:bg-blue-300 rounded-xl inline-flex justify-center items-center gap-2.5"
              >
                <div className="text-center text-white text-lg font-medium leading-7">
                  {saving ? "Changing..." : "Change password"}
                </div>
              </button>
            </div>
          </div>
      </CardFrame>

      <ConfirmModal
        open={isConfirmOpen}
        title="Change password now?"
        description="Are you sure you want to change your password? You’ll use the new password the next time you sign in."
        confirmText={saving ? "Changing..." : "Change"}
        cancelText="Cancel"
        isConfirmDisabled={saving}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          setIsConfirmOpen(false);
          await onSubmit();
        }}
      />

      <NoticeModal
        open={isSuccessOpen}
        title="✅ Password changed"
        description="Your password has been updated successfully."
        buttonText="Back"
        autoCloseMs={1200}
        onClose={() => {
          setIsSuccessOpen(false);
          router.back();
        }}
      />
    </AppLayout>
  );
}
