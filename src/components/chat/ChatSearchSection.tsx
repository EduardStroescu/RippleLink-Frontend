import { memo } from "react";

import { CustomDialogTrigger } from "@/components/CustomDialogTrigger";
import { SearchForm } from "@/components/forms/SearchForm";
import { SearchUsersForm } from "@/components/forms/SearchUsersForm";
import { AddIcon } from "@/components/Icons";

export const ChatSearchSection = memo(
  ({
    handleSearch,
  }: {
    handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => {
    return (
      <div className="flex flex-row mx-3.5 items-center justify-center gap-2">
        <SearchForm onChange={handleSearch} />
        <CustomDialogTrigger
          header="Start new chat"
          content={<SearchUsersForm />}
          className="group"
        >
          <AddIcon title="Start new chat" />
        </CustomDialogTrigger>
      </div>
    );
  }
);

ChatSearchSection.displayName = "ChatSearchSection";
