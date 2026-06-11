"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
}

export function SafeImage({ src, alt, fill, sizes, quality, priority, className, containerClassName }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-fg/30 ${containerClassName ?? "w-full h-full"}`}>
        <ImageOff size={28} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      quality={quality}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
