import { memo } from "react";

import { CustomDialogTrigger } from "@/components/CustomDialogTrigger";
import { SearchForm } from "@/components/forms/SearchForm";
import { SearchUsersForm } from "@/components/forms/SearchUsersForm";
import { AddIcon } from "@/components/Icons";

export const ChatSearchSection = memo(function ChatSearchSection({
  handleSearch,
}: {
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-row mx-3.5 items-center justify-center gap-2">
      <SearchForm onChange={handleSearch} />
      <CustomDialogTrigger
        header="Start new chat"
        dialogContent={<SearchUsersForm />}
        className="group"
        title="Start new chat"
        aria-label="Start new chat"
      >
        <AddIcon />
      </CustomDialogTrigger>
    </div>
  );
});
