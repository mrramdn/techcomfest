"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AppLayout, { useSetUser, useUser } from "../_components/AppLayout";
import ConfirmModal from "../_components/ConfirmModal";
import NoticeModal from "../_components/NoticeModal";
import CardFrame from "../_components/CardFrame";
import StatusLine from "../_components/StatusLine";

type UserShape = {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string | null;
};

type UpdateProfileResponse = {
  success: boolean;
  message?: string;
  user?: UserShape;
};

export default function ProfilePage() {
  return (
    <AppLayout showHeader={false}>
      <ProfileContent />
    </AppLayout>
  );
}

function ProfileContent() {
  const router = useRouter();
  const user = useUser();
  const setUser = useSetUser();

  const [name, setName] = useState(user?.name ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    };
  }, []);

  const avatarSrc = user?.profilePicture || null;

  const onSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      if (photoFile) form.append("photo", photoFile);

      const res = await fetch("/api/profile", { method: "POST", body: form });
      const data = (await res.json()) as UpdateProfileResponse;

      if (!res.ok || !data.success || !data.user) {
        setError(data.message || "Failed to update profile.");
        return;
      }

      setUser(data.user);
      setPhotoFile(null);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setPreviewUrl(null);
      setName(data.user.name);
      setIsSuccessOpen(true);
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CardFrame>
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-black/70 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          <span className="text-sm font-medium leading-5">Back</span>
        </button>

        <div className="mx-auto w-96 max-w-full flex flex-col justify-start items-start gap-7">
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="inline-flex justify-center items-center gap-5">
                <div className="size-11 px-3 py-1 bg-blue-500 rounded-xl inline-flex flex-col justify-center items-center">
                  <div className="text-slate-50 text-2xl font-bold leading-10">
                    L
                  </div>
                </div>
                <div className="text-black text-xl font-bold leading-8">
                  Lahap
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch text-black text-2xl font-medium leading-8">
                  Edit profile
                </div>
                <div className="self-stretch text-gray-500 text-base font-normal leading-6">
                  Update your personal information to keep your account accurate
                  and up to date.
                </div>
              </div>
            </div>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-7">
            <div className="self-stretch flex flex-col justify-center items-center gap-4">
              <div className="size-40 flex flex-col justify-start items-start gap-1.5">
                <label className="self-stretch flex-1 px-3.5 py-3 relative rounded-xl outline outline-offset-1 outline-gray-300 inline-flex justify-between items-center cursor-pointer overflow-visible">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      setError(null);

                      const nextFile = e.target.files?.[0] ?? null;
                      setPhotoFile(nextFile);

                      if (previewUrlRef.current)
                        URL.revokeObjectURL(previewUrlRef.current);
                      previewUrlRef.current = null;

                      if (nextFile) {
                        const nextUrl = URL.createObjectURL(nextFile);
                        previewUrlRef.current = nextUrl;
                        setPreviewUrl(nextUrl);
                      } else {
                        setPreviewUrl(null);
                      }
                    }}
                  />

                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Profile picture preview"
                        className="w-full h-full object-cover"
                      />
                    ) : avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt="Profile picture"
                        fill
                        className="object-cover"
                        sizes="160px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-white" />
                    )}
                    <div className="absolute inset-0 bg-black/10" />
                  </div>

                  <div className="absolute -bottom-3 -right-3 z-10 size-16 p-3.5 bg-slate-100 rounded-full outline outline-offset-1 outline-gray-300 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[28px] text-gray-500">
                      add_a_photo
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch text-black text-base font-medium leading-6">
                  Your name
                </div>
                <div className="self-stretch h-12 px-3.5 py-3 bg-slate-200 rounded-xl outline outline-offset-1 outline-gray-300 inline-flex justify-between items-center gap-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-900 text-base font-normal leading-6 placeholder:text-gray-500"
                    placeholder="Your name"
                  />
                  <span className="material-symbols-outlined text-xl text-gray-500">
                    edit
                  </span>
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
                  if (!name.trim()) {
                    setError("Name is required.");
                    return;
                  }
                  setIsConfirmOpen(true);
                }}
                className="h-11 px-20 py-2 bg-blue-500 disabled:bg-blue-300 rounded-xl inline-flex justify-center items-center gap-2.5"
              >
                <div className="text-center text-white text-lg font-medium leading-7">
                  {saving ? "Updating..." : "Update"}
                </div>
              </button>
            </div>
          </div>
        </div>
      </CardFrame>

      <ConfirmModal
        open={isConfirmOpen}
        title="📝 Save profile changes?"
        description="Are you sure you want to update your profile information? This will update your name and/or profile picture."
        confirmText={saving ? "Updating..." : "Update"}
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
        title="✅ Profile updated"
        description="Your profile information has been saved."
        buttonText="Back"
        autoCloseMs={1200}
        onClose={() => {
          setIsSuccessOpen(false);
          router.back();
        }}
      />
    </>
  );
}
