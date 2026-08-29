import { Sparkles } from "lucide-react";
import { BlueMarbleButton } from "../primitives";

export interface TranslateAskButtonProps { onClick: () => void; disabled?: boolean; }

export function TranslateAskButton({ onClick, disabled = false }: TranslateAskButtonProps) {
  return (
    <BlueMarbleButton className="translate-ask-button" onClick={onClick} disabled={disabled} aria-label="Send">
      <Sparkles size={20} strokeWidth={1.6} />
      Send
    </BlueMarbleButton>
  );
}
