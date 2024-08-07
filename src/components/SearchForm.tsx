import { cn } from "@/lib/utils";
import { ChangeEvent } from "react";

export function SearchForm({
  onChange,
  className,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <input
      type="search"
      name="search"
      className={cn(
        "w-full py-2 px-4 text-white rounded-xl bg-black/60",
        className
      )}
      placeholder="Search Chats"
      onChange={(e) => onChange(e)}
    />
  );
}
