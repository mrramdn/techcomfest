"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardFrame from "../../_components/CardFrame";
import StatusLine from "../../_components/StatusLine";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setMessage("");
    setStatus("idle");
    if (!f) {
      setPhotoFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    const max = 5 * 1024 * 1024; // 5MB
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (f.size > max) {
      setMessage("Image too large. Max 5MB.");
      setStatus("error");
      e.currentTarget.value = "";
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }
    if (f.type && !allowed.includes(f.type)) {
      setMessage("Invalid image type. Use JPG/PNG/WEBP.");
      setStatus("error");
      e.currentTarget.value = "";
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    setPhotoFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("Please enter your name");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const form = new FormData();
      form.append("name", name.trim());
      if (photoFile) form.append("photo", photoFile);

      const res = await fetch("/api/auth/complete", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.message || "Failed to save. Try again.");
        return;
      }

      router.push(data.redirect || "/");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Failed to save. Try again.");
    }
  };

  const handleSkip = () => router.push("/");

  return (
    <main>
      <CardFrame>
        <div className="mx-auto w-96 max-w-full flex flex-col justify-start items-start gap-7">
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="inline-flex justify-center items-center gap-5">
                <div className="size-11 px-3 py-1 bg-blue-500 rounded-xl inline-flex flex-col justify-center items-center">
                  <div className="text-slate-50 text-2xl font-bold leading-10">L</div>
                </div>
                <div className="text-black/20 text-xl font-bold leading-8">Lahap</div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch text-black text-2xl font-medium leading-8">Set up your profile</div>
                <div className="self-stretch text-gray-500 text-base font-normal leading-6">
                  Add a display name and a profile photo to personalize your account.
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <div className="self-stretch text-black text-base font-medium leading-6">Your name</div>
              <div className="self-stretch h-12 px-3.5 py-3 bg-slate-200 rounded-xl outline -outline-offset-1 outline-gray-300 inline-flex justify-between items-center gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-transparent outline-none text-gray-900 text-base font-normal leading-6 placeholder:text-gray-500"
                  required
                />
                <span className="material-symbols-outlined text-xl text-gray-500">edit</span>
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <div className="self-stretch text-black text-base font-medium leading-6">Profile photo (optional)</div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden outline -outline-offset-1 outline-gray-300">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-sm">No photo</div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="inline-block">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="photo-input" />
                    <div className="h-12 px-4 bg-slate-100 rounded-xl outline -outline-offset-1 outline-gray-300 inline-flex items-center gap-2 cursor-pointer hover:bg-slate-200 transition-colors">
                      <span className="material-symbols-outlined text-base text-gray-600">photo_camera</span>
                      <span className="text-sm text-gray-700">Choose file</span>
                    </div>
                  </label>
                  {photoFile && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="text-sm text-gray-700 truncate">{photoFile.name}</div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPreview(null);
                          setMessage("");
                          const input = document.getElementById("photo-input") as HTMLInputElement | null;
                          if (input) input.value = "";
                        }}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">JPEG, PNG, or WEBP — up to 5MB</div>
                </div>
              </div>
            </div>

            <div className="self-stretch flex flex-col gap-2">
              <StatusLine kind={status === "error" ? "error" : "success"} message={message} />

              <button type="submit" disabled={status === "loading"} className="h-11 px-20 py-2 bg-blue-500 disabled:bg-blue-300 rounded-xl inline-flex justify-center items-center gap-2.5">
                <div className="text-center text-white text-lg font-medium leading-7">{status === "loading" ? "Saving..." : "Save and continue"}</div>
              </button>
            </div>

            <button type="button" onClick={handleSkip} className="self-stretch h-11 rounded-xl bg-transparent text-sm text-gray-600 hover:underline">
              Skip for now
            </button>
          </form>
        </div>
      </CardFrame>
    </main>
  );
}
