export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 font-medium">Loading...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your experience</p>
      </div>
    </div>
  );
}
