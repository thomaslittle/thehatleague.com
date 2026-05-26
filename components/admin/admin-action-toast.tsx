"use client";

import { useEffect } from "react";
import { showLeagueToast } from "@/components/ui/league-toast";
import {
  ADMIN_TOAST_COPY,
  type AdminToastKind,
} from "@/lib/admin/toast-kinds";

// NOTE: import parseAdminToastKind from "@/lib/admin/toast-kinds" directly
// in server components. Re-exporting from this "use client" file would
// drag the import back across the client/server boundary.

export function AdminActionToast({ kind }: { kind: AdminToastKind | null }) {
  useEffect(() => {
    if (!kind) return;
    const copy = ADMIN_TOAST_COPY[kind];
    showLeagueToast({
      id: `admin-action-${kind}`,
      eyebrow: "Admin action",
      prefix: copy.prefix,
      body: copy.body,
    });
  }, [kind]);

  return null;
}
