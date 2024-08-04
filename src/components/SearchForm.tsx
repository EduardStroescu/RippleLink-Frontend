import { ChangeEvent } from "react";

export function SearchForm({
  onChange,
  className,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <input
        type="search"
        name="search"
        className="w-full py-2 px-4 text-white rounded-xl bg-black/60"
        placeholder="Search Chats"
        onChange={(e) => onChange(e)}
      />
    </div>
  );
}
