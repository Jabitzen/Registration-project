export function Button({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${className}`}
    >
      {children}
    </button>
  );
}
