import Image, { type ImageProps } from "next/image";

type ExternalImageProps = Omit<ImageProps, "unoptimized">;

export function ExternalImage({ alt, ...props }: ExternalImageProps) {
  return <Image {...props} alt={alt} unoptimized />;
}
