import { useEffect, useRef, useState } from "react";
import { SendIcon } from "./Icons";
import { CustomChatInput } from "./ui/CustomChatInput";
import userApi from "@/api/modules/user.api";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./ui/use-toast";
import { useUserStore, useUserStoreActions } from "@/stores/useUserStore";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { User } from "@/types/user";

export function ChangeStatusForm() {
  const { toast } = useToast();
  const user = useUserStore((state) => state.user);
  const { setUser } = useUserStoreActions();
  const { setItem } = useLocalStorage<User>("user");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (user?.status?.statusMessage) {
      setStatusMessage(user?.status?.statusMessage);
    }
  }, []);

  const handleKeyDown = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const changeStatusMutation = useMutation({
    mutationFn: (formData: { statusMessage: string }) =>
      userApi.statusUpdate(formData),
  });

  const handleSubmitStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!statusMessage) return;
    await changeStatusMutation.mutateAsync(
      { statusMessage },
      {
        onSuccess: (response) => {
          if (response.statusMessage) {
            setStatusMessage(response.statusMessage);
            setUser((prevUser) => {
              const updatedUser = prevUser && {
                ...prevUser,
                status: response,
              };
              updatedUser && setItem(updatedUser);
              return updatedUser;
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
        disabled={changeStatusMutation.isPending}
        className="group"
      >
        <SendIcon title="Save" />
      </button>
    </form>
  );
}
