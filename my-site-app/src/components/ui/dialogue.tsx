import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface DialogProps extends DialogPrimitive.DialogProps {
  children: React.ReactNode;
}

export function Dialog({ children, ...props }: DialogProps) {
  return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>;
}

export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export function DialogTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Trigger className={cn("p-2", className || "")}>
      {children}
    </DialogPrimitive.Trigger>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
      <DialogPrimitive.Content
        className={cn(
          "bg-gray-800 text-white p-6 rounded-lg shadow-lg",
          className || ""
        )}
      >
        {/* Close Button */}
        <DialogPrimitive.Close className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </DialogPrimitive.Close>

        {/* Modal Content */}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
