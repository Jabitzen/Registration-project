import { HTMLAttributes, ReactNode } from "react";

export function Label({
  children,
  htmlFor,
  className = "block text-sm font-semibold text-gray-700",
  ...props
}: {
  children: ReactNode;
  htmlFor?: string;
} & HTMLAttributes<HTMLLabelElement>) {
  return (
    <label htmlFor={htmlFor} className={className} {...props}>
      {children}
    </label>
  );
}
