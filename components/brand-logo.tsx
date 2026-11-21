import Image from "next/image";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/dreamy-logo.png"
      alt="Dreamy"
      width={300}
      height={100}
      className={className}
      priority
    />
  );
}
