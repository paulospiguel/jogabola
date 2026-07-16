import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

type ArenaEmptyStateBaseProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

type ArenaEmptyStateIconProps = ArenaEmptyStateBaseProps & {
  icon: React.ElementType;
  image?: never;
};

type ArenaEmptyStateImageProps = ArenaEmptyStateBaseProps & {
  icon?: never;
  image: {
    src: string | StaticImageData;
    alt: string;
    width: number;
    height: number;
  };
};

export type ArenaEmptyStateProps =
  | ArenaEmptyStateIconProps
  | ArenaEmptyStateImageProps;

export function ArenaEmptyState(props: ArenaEmptyStateProps) {
  const { title, description, action, className } = props;

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col items-center justify-center rounded-[14px] border border-arena-border bg-arena-surface/70 px-4 py-6 text-center sm:px-5",
        className,
      )}
    >
      {props.icon ? (
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-arena-border bg-arena-surface-el text-arena-text-muted">
          <props.icon size={18} strokeWidth={2.4} />
        </div>
      ) : (
        <Image
          src={props.image.src}
          alt={props.image.alt}
          width={props.image.width}
          height={props.image.height}
          className="mb-3 h-auto w-full object-contain"
          style={{ maxWidth: props.image.width }}
        />
      )}
      <h3 className="text-sm font-bold text-arena-text">{title}</h3>
      {description && (
        <p className="mt-1 max-w-[260px] text-xs leading-5 text-arena-text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
