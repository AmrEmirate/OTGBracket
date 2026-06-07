"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userStr = searchParams.get("user");
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        localStorage.setItem("user", JSON.stringify(user));
        
        // Redirect to Home
        router.push("/");
      } catch (err) {
        console.error("Failed to parse user data", err);
        router.push("/login?error=invalid_token");
      }
    } else {
      router.push("/login?error=missing_token");
    }
  }, [router, searchParams]);

  return null;
}

export default function CallbackPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-md">
      <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
      </div>
      <h2 className="text-xl font-bold text-on-surface">Memproses Login...</h2>
      <p className="text-on-surface-variant mt-2">Mohon tunggu sebentar, Anda sedang dialihkan.</p>
      <Suspense fallback={null}>
        <CallbackLogic />
      </Suspense>
    </div>
  );
}
