import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean; // Add disabled prop
}

export function Button({
  children,
  className,
  onClick,
  disabled,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md transition-colors ${
        disabled ? "bg-gray-400 cursor-not-allowed" : "hover:bg-blue-700"
      } ${className}`}
    >
      {children}
    </button>
  );
}
