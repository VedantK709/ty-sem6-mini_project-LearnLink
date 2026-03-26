import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import LearnLinkChat from "@/components/LearnLinkChat";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 flex flex-col items-center py-8 px-4">
        {session ? (
          <>
            <div className="w-full max-w-3xl mb-6 text-center">
              <h1 className="text-3xl font-bold text-slate-800">
                Find Your Perfect Course
              </h1>
              <p className="text-slate-600 mt-2">
                LearnLink helps you navigate Coursera, Udemy, and more to
                optimize your learning path.
              </p>
            </div>
            <LearnLinkChat />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center max-w-lg">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Welcome to LearnLink
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Please sign in with your Google account to receive personalized
                technical course recommendations.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
