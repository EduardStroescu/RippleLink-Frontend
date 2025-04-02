import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { userApi } from "@/api/modules/user.api";
import { SendIcon } from "@/components/Icons";
import { CustomChatInput } from "@/components/ui/CustomChatInput";
import { toast } from "@/components/ui/use-toast";
import { useUserStore, useUserStoreActions } from "@/stores/useUserStore";

export function ChangeStatusForm() {
  const user = useUserStore((state) => state.user);
  const { setUser } = useUserStoreActions();
  const [statusMessage, setStatusMessage] = useState<string>(
    user?.status?.statusMessage ?? ""
  );
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const { mutateAsync: changeStatusMutation, isPending } = useMutation({
    mutationFn: (formData: { statusMessage: string }) =>
      userApi.statusUpdate(formData),
  });

  const handleSubmitStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!statusMessage) return;
    await changeStatusMutation(
      { statusMessage },
      {
        onSuccess: (response) => {
          if (response.statusMessage) {
            setStatusMessage(response.statusMessage);
            setUser((prevUser) => {
              if (!prevUser) return prevUser;
              return {
                ...prevUser,
                status: response,
              };
            });
            toast({
              title: "Success",
              description: "Status updated.",
            });
          }
        },
        onError: (error: unknown) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error as string,
          });
        },
      }
    );
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmitStatus}
      className="my-4 flex gap-2"
    >
      <CustomChatInput
        message={statusMessage}
        setMessage={setStatusMessage}
        handleKeyDown={handleKeyDown}
      />
      <button
        type="submit"
        aria-label="Save Status"
        title="Save Status"
        disabled={isPending}
        className="group"
      >
        <SendIcon />
      </button>
    </form>
  );
}
