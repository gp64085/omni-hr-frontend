export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-pulse flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-slate-200">Loading OmniHR Workspace...</p>
        <p className="text-xs text-slate-500">Preparing corporate modules and access policies</p>
      </div>
    </div>
  );
}
