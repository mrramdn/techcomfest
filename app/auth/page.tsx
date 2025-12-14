"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";

type Mode = "signin" | "signup";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryModeParam = searchParams?.get("mode");
  const queryMode: Mode = queryModeParam === "signup" ? "signup" : "signin";
  const redirectTarget = searchParams?.get("redirect") || "/home";

  const [mode, setMode] = useState<Mode>(queryMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok && mounted) {
          // User is already logged in, redirect immediately
          setIsRedirecting(true);
          router.replace("/");
          return;
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "signin"
          ? { email, password }
          : { email, password, name: email.split("@")[0] };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.message || "Failed");
        return;
      }

      const destination = data.redirectUrl || redirectTarget || "/home";
      router.push(destination);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("An error occurred");
    }
  };

  // Show loading while checking auth or redirecting
  if (isCheckingAuth || isRedirecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 rounded-lg overflow-hidden">
            <Image 
              src="/images/icon/logo.png" 
              alt="Lahap Logo" 
              width={40} 
              height={40} 
              className="w-full h-full object-contain animate-pulse" 
              priority
            />
          </div>
          <div className="text-gray-500 text-sm animate-pulse">
            {isRedirecting ? "Redirecting..." : "Loading..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative h-screen overflow-hidden flex">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          backgroundImage: 'url("/images/auth/bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'translateX(25%)'
        }}
      />
      
      {/* Left Panel - Form */}
      <div className="relative w-full md:w-1/2 h-full overflow-hidden md:rounded-br-[36px] md:rounded-tr-[36px] bg-white px-6 md:px-24 py-11 flex items-center justify-center z-10">
        <div className="w-full max-w-md flex flex-col gap-7">
          {/* Logo */}
          <div className="inline-flex items-center gap-5">
            <div className="size-11 rounded-xl overflow-hidden">
              <Image src="/images/icon/logo.png" alt="Lahap Logo" width={44} height={44} className="w-full h-full object-contain" />
            </div>
            <div className="text-black text-xl font-bold leading-8">Lahap</div>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-[3px]">
            <div className="text-black text-2xl font-medium leading-8">
              {mode === "signup" ? "Create account 😁" : "Welcome back 👋"}
            </div>
            <div className="text-gray-500 text-base font-normal leading-6">
              {mode === "signup" ? "Let's get started" : "We are happy to see you again"}
            </div>
          </div>

          {/* Tab Switch */}
          <div className="h-11 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300 p-1 inline-flex gap-1 w-full">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-lg py-2 flex items-center justify-center transition-colors cursor-pointer ${
                mode === "signin" ? "bg-blue-500" : "bg-slate-200 hover:bg-slate-300"
              }`}
            >
              <div className={`text-center text-base font-medium leading-6 ${
                mode === "signin" ? "text-white" : "text-black"
              }`}>
                Sign in
              </div>
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg py-2 flex items-center justify-center transition-colors cursor-pointer ${
                mode === "signup" ? "bg-blue-500" : "bg-slate-200 hover:bg-slate-300"
              }`}
            >
              <div className={`text-center text-base font-medium leading-6 ${
                mode === "signup" ? "text-white" : "text-black"
              }`}>
                Sign up
              </div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="text-black text-base font-medium leading-6">Email address</div>
              <div className="h-12 rounded-xl bg-slate-200 px-3.5 py-3 outline outline-1 outline-offset-[-1px] outline-gray-300 flex items-center justify-between">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter your email"
                  className="flex-1 bg-transparent text-gray-500 text-base font-normal leading-6 outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-black text-base font-medium leading-6">
                {mode === "signup" ? "Create a password" : "Password"}
              </div>
              <div className="h-12 rounded-xl bg-slate-200 px-3.5 py-3 outline outline-1 outline-offset-[-1px] outline-gray-300 flex items-center justify-between">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "password must be 8 character" : "enter your password"}
                  className="flex-1 bg-transparent text-gray-500 text-base font-normal leading-6 outline-none"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {mode === "signin" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    className="w-4 h-4 border-gray-300 text-blue-500 focus:ring-blue-500 accent-blue-500"
                  />
                  <span className="text-gray-400 text-sm font-normal leading-5">Remember me</span>
                </label>
                <a href="/auth/forgot" className="text-blue-500 text-sm font-normal leading-5 hover:underline transition-all">
                  Forgot password?
                </a>
              </div>
            )}

            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <div className="text-black text-base font-medium leading-6">Confirm password</div>
                <div className="h-12 rounded-xl bg-slate-200 px-3.5 py-3 outline outline-1 outline-offset-[-1px] outline-gray-300 flex items-center justify-between">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="flex-1 bg-transparent text-gray-500 text-base font-normal leading-6 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {message && (
              <div className={`text-sm ${status === "error" ? "text-red-500" : "text-green-500"}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="h-11 rounded-xl bg-blue-500 py-2 w-full inline-flex items-center justify-center gap-2.5 disabled:opacity-50 hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <div className="text-center text-white text-lg font-medium leading-7">
                {status === "loading" ? "Loading..." : mode === "signup" ? "Sign up" : "Sign in"}
              </div>
            </button>
          </form>

          {/* Divider */}
          <div className="inline-flex items-center gap-4">
            <div className="flex-1 h-0 outline outline-[1.50px] outline-offset-[-0.75px] outline-gray-300" />
            <div className="text-center text-gray-300 text-base font-normal leading-6">Or</div>
            <div className="flex-1 h-0 outline outline-[1.50px] outline-offset-[-0.75px] outline-gray-300" />
          </div>

          {/* Social Sign-in */}
          <div className="flex flex-col gap-3">
            <button className="rounded-xl bg-gray-200 py-2.5 w-full outline outline-1 outline-offset-[-1px] outline-gray-300 inline-flex items-center justify-center gap-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <div className="text-center text-gray-700 text-base font-medium leading-6">Log in with google</div>
            </button>
            <button className="rounded-xl bg-black py-2.5 w-full inline-flex items-center justify-center gap-2.5 hover:bg-gray-900 transition-colors cursor-pointer">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <div className="text-center text-white text-base font-medium leading-6">Log in with Apple</div>
            </button>
          </div>
        </div>
      </div>

    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 rounded-lg overflow-hidden">
            <Image 
              src="/images/icon/logo.png" 
              alt="Lahap Logo" 
              width={40} 
              height={40} 
              className="w-full h-full object-contain animate-pulse" 
              priority
            />
          </div>
          <div className="text-gray-500 text-sm animate-pulse">Loading...</div>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
