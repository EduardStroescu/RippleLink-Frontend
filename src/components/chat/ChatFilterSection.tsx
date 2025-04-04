import { memo } from "react";

import { FilterOption } from "@/types/filterOptions";

export const ChatFilterSection = memo(
  ({ handleFilter }: { handleFilter: (filter: FilterOption) => void }) => {
    const filterOptions: FilterOption[] = ["All", "Unread", "Groups"];
    return (
      <div className="flex justify-around items-center gap-2 py-2 text-white border-b-[1px] border-slate-700 px-1">
        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => handleFilter(option)}
            className="w-full text-slate-300 hover:text-white"
          >
            {option}
          </button>
        ))}
      </div>
    );
  }
);

ChatFilterSection.displayName = "ChatFilterSection";
