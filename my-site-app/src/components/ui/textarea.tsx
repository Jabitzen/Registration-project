export function Textarea({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}) {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 border border-gray-300 rounded-md w-full"
      rows={4}
    />
  );
}
