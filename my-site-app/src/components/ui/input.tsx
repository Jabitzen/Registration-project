export function Input({
  name,
  value,
  onChange,
  type = "text",
}: {
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 border border-gray-300 rounded-md w-full"
    />
  );
}
