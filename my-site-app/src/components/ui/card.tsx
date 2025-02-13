export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border rounded-lg shadow-md bg-white ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b">{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4 h-51.25rem">{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-gray-800">{children}</h2>;
}
