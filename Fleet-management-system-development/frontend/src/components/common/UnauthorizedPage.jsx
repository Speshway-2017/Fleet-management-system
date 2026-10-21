export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold text-gray-900">403 — Unauthorized</h1>
      <p className="text-gray-500">You don't have access to this page.</p>
    </div>
  );
}
