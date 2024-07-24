import { FormEvent } from "react";

export function SearchForm({
  handleSearchSubmit,
  className,
}: {
  handleSearchSubmit: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
}) {
  return (
    <form onSubmit={handleSearchSubmit} className={className}>
      <input
        type="search"
        name="search"
        className="w-full py-2 px-4 text-white rounded-xl bg-black/60"
        placeholder="Search Chats"
      />
    </form>
  );
}
