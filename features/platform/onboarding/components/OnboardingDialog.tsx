"use client";

import Link from "next/link";
import { Pill, pillClass, Track } from "../../components/kit";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Family layout-level dialog. Operator setup stays on the onboarding page, whose server-side
 * role and MFA checks gate the tenant configuration form. */
export default function OnboardingDialog({ isOpen, onClose }: {
  isOpen: boolean; onClose(): void;
}) {
  return <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Operator setup</DialogTitle>
        <DialogDescription>MFA-verified session required</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Track>
          <Pill variant="flat" onClick={onClose}>Not now</Pill>
          <Link href="/dashboard/platform/onboarding" onClick={onClose} className={pillClass("primary")}>Open onboarding</Link>
        </Track>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
