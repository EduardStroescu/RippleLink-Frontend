import { createFileRoute, Link } from "@tanstack/react-router";

import {
  ChangeBackgroundForm,
  ChangePasswordForm,
  ChangeUserDetailsForm,
  DeleteAccountForm,
  BackIcon,
} from "@/components";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

export const Route = createFileRoute("/chat/settings")({
  component: () => <ChatSettings />,
});

function ChatSettings() {
  return (
    <aside className="flex w-full h-full">
      <div className={`flex sm:flex relative flex-1 flex-col overflow-hidden`}>
        <div className="flex px-2 flex-row gap-2 text-white min-h-[56px] items-center">
          <Link
            to="/chat"
            preload={false}
            className="group flex sm:hidden gap-1 items-center"
          >
            <BackIcon /> <span className="text-xs">Back</span>
          </Link>
          <p className="ml-2 text-lg">Settings</p>
        </div>
        <div className="w-full flex-1 h-full p-4 text-white overflow-y-auto flex flex-col gap-1">
          <Accordion
            type="single"
            collapsible
            className="w-full h-full flex flex-col gap-2"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="px-2 rounded-lg border-[1px] border-slate-600 bg-cyan-800/40">
                Change User Details
              </AccordionTrigger>
              <AccordionContent className="mt-1">
                <ChangeUserDetailsForm />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="px-2 rounded-lg border-[1px] border-slate-600 bg-cyan-800/40">
                Change App Colors
              </AccordionTrigger>
              <AccordionContent className="mt-1">
                <ChangeBackgroundForm />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="px-2 rounded-lg border-[1px] border-slate-600 bg-cyan-800/40">
                Change Password
              </AccordionTrigger>
              <AccordionContent className="mt-1">
                <ChangePasswordForm />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="px-2 mb-1 rounded-lg border-[1px] border-slate-600 bg-red-950/40">
                Delete Account
              </AccordionTrigger>
              <AccordionContent className="mt-1">
                <DeleteAccountForm />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </aside>
  );
}
