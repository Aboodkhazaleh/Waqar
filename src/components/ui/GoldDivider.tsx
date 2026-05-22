import { cn } from "@/lib/utils";

interface GoldDividerProps {
  className?: string;
  center?: boolean;
}

export default function GoldDivider({ className, center = false }: GoldDividerProps) {
  return (
    <div className={cn("flex items-center gap-3", center ? "justify-center" : "", className)}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="flex gap-1.5 items-center">
        <div className="w-1 h-1 rounded-full bg-gold/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
        <div className="w-1 h-1 rounded-full bg-gold/60" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </div>
  );
}
