"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Link as LinkIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { submitAsset } from "@/app/actions/assets";
import type { AssetKind, AssetTargetType } from "@/lib/data/assets";

const MAX_BYTES = 25 * 1024 * 1024;

function kindForFile(file: File): AssetKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "clip";
  if (file.name.toLowerCase().endsWith(".replay")) return "replay";
  return "file";
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

/** Attach a clip/asset to an entity — paste a link or upload a file. */
export function AssetSubmit({
  targetType,
  targetId,
  label = "Add clip / asset",
}: {
  targetType: AssetTargetType;
  targetId: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"link" | "upload">("link");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<AssetKind>("clip");
  const [file, setFile] = useState<File | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setUrl("");
    setTitle("");
    setKind("clip");
    setFile(null);
    setOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submitLink = () =>
    start(async () => {
      const res = await submitAsset({ kind, source: "link", url, title, targetType, targetId });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Added");
      reset();
      router.refresh();
    });

  const submitUpload = () => {
    if (!file) {
      toast.error("Choose a file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File must be under 25 MB.");
      return;
    }
    start(async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sign in first.");
        return;
      }
      const path = `${user.id}/${targetType}/${crypto.randomUUID()}-${sanitize(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from("league-assets")
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (upErr) {
        toast.error(upErr.message);
        return;
      }
      const { data: pub } = supabase.storage.from("league-assets").getPublicUrl(path);
      const res = await submitAsset({
        kind: kindForFile(file),
        source: "upload",
        url: pub.publicUrl,
        storagePath: path,
        title,
        mimeType: file.type || null,
        sizeBytes: file.size,
        targetType,
        targetId,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Uploaded");
      reset();
      router.refresh();
    });
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" aria-hidden />
        {label}
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex gap-2">
        <Button variant={mode === "link" ? "default" : "outline"} size="xs" onClick={() => setMode("link")}>
          <LinkIcon className="h-3 w-3" aria-hidden />
          Link
        </Button>
        <Button variant={mode === "upload" ? "default" : "outline"} size="xs" onClick={() => setMode("upload")}>
          <Upload className="h-3 w-3" aria-hidden />
          Upload
        </Button>
      </div>

      {mode === "link" ? (
        <>
          <Field label="URL" className="mt-3">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </Field>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Type">
              <Select value={kind} onValueChange={(v) => setKind(v as AssetKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clip">Clip</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="replay">Replay</SelectItem>
                  <SelectItem value="file">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Title (optional)">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </Field>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled={pending || !url.trim()} onClick={submitLink}>
              Add
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <Field label="File" className="mt-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*,.replay"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-thl-orange file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-black dark:text-neutral-300"
            />
          </Field>
          <Field label="Title (optional)" className="mt-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          </Field>
          <p className="mt-2 text-xs text-neutral-400">Images, replays, or short videos up to 25 MB.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled={pending || !file} onClick={submitUpload}>
              {pending ? "Uploading…" : "Upload"}
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
