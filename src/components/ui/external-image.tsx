"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ExternalImageProps = Omit<ImageProps, "unoptimized">;

const storagePrefix = "supabase://";

function parseStorageRef(value: string) {
  if (!value.startsWith(storagePrefix)) return null;
  const remainder = value.slice(storagePrefix.length);
  const separator = remainder.indexOf("/");
  if (separator <= 0 || separator === remainder.length - 1) return null;
  return {
    bucket: remainder.slice(0, separator),
    path: remainder.slice(separator + 1),
  };
}

export function ExternalImage({ alt, src, className, ...props }: ExternalImageProps) {
  const storageRef = typeof src === "string" ? parseStorageRef(src) : null;
  const [resolvedSrc, setResolvedSrc] = useState<ImageProps["src"] | null>(
    storageRef ? null : src,
  );

  useEffect(() => {
    if (!storageRef) {
      setResolvedSrc(src);
      return;
    }

    let active = true;
    const supabase = createClient();

    void supabase.storage
      .from(storageRef.bucket)
      .createSignedUrl(storageRef.path, 60 * 60)
      .then(({ data, error }) => {
        if (!active) return;
        setResolvedSrc(error || !data?.signedUrl ? null : data.signedUrl);
      });

    return () => {
      active = false;
    };
  }, [src, storageRef?.bucket, storageRef?.path]);

  if (!resolvedSrc) {
    return <span aria-hidden="true" className={className} />;
  }

  return <Image {...props} className={className} src={resolvedSrc} alt={alt} unoptimized />;
}
