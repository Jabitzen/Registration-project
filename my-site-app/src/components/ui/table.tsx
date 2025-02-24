import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string; // Add className prop
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <table
      className={`w-full border-collapse border border-gray-300 ${
        className || ""
      }`}
    >
      {children}
    </table>
  );
}

export function TableHead({ children, className }: TableHeadProps) {
  return <thead className={`bg-gray-100 ${className || ""}`}>{children}</thead>;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <th
      className={`border border-gray-300 px-4 py-2 text-left ${
        className || ""
      }`}
    >
      {children}
    </th>
  );
}

export function TableRow({ children, className }: TableRowProps) {
  return <tr className={`hover:bg-gray-50 ${className || ""}`}>{children}</tr>;
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td className={`border border-gray-300 px-4 py-2 ${className || ""}`}>
      {children}
    </td>
  );
}

export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={className || ""}>{children}</tbody>;
}
