import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string; // Make type optional with a default value
}

export function Input({
  name,
  value,
  onChange,
  type = "text",
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 border border-gray-300 rounded-md w-full"
      {...props} // Spread remaining props (e.g., min, max, etc.)
    />
  );
}
