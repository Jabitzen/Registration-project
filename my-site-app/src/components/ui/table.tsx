export function Table({ children }: { children: React.ReactNode }) {
  return (
    <table className="w-full border-collapse border border-gray-300">
      {children}
    </table>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-100">{children}</thead>;
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="border border-gray-300 px-4 py-2 text-left">{children}</th>
  );
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-gray-50">{children}</tr>;
}

export function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="border border-gray-300 px-4 py-2">{children}</td>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}
