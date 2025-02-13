import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Dialog({ children }: { children: React.ReactNode }) {
  return <DialogPrimitive.Root>{children}</DialogPrimitive.Root>;
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

export function DialogContent({ children }: { children: React.ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
      <DialogPrimitive.Content className="fixed left-0 top-0 w-64 h-full bg-white shadow-lg p-4">
        {/* Close Button */}
        <DialogPrimitive.Close className="absolute top-2 right-2 p-2">
          <X size={24} />
        </DialogPrimitive.Close>

        {/* Modal Content */}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
