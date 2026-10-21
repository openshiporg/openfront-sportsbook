"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
        <DialogDescription>Create the first tenant, brand, pending jurisdiction, sandbox adapters, catalog root, and limit profile. Setup requires an MFA-assured operator session.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Not now</Button>
        <Button asChild><Link href="/dashboard/platform/onboarding" onClick={onClose}>Open onboarding</Link></Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
