import { SwitchProps } from "@radix-ui/react-switch";
import * as SwitchPrimitive from "@radix-ui/react-switch";

// Custom Switch component using Radix UI
const Switch = ({ checked, onCheckedChange, ...props }: SwitchProps) => (
  <SwitchPrimitive.Root
    checked={checked}
    onCheckedChange={onCheckedChange}
    className={`
      w-[42px] h-[25px] rounded-full relative
      transition-colors duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-blue-500
      ${checked ? "bg-blue-600" : "bg-gray-200"}
    `}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={`
        w-[21px] h-[21px] bg-white rounded-full shadow-md transform
        transition-transform duration-200 ease-in-out
        ${
          checked
            ? "translate-x-[17px] bg-blue-400"
            : "translate-x-[1px] bg-gray-400"
        }
      `}
    />
  </SwitchPrimitive.Root>
);

export { Switch };
