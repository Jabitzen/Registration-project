export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-gray-700">
      {children}
    </label>
  );
}
