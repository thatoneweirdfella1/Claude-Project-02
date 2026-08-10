import { Sparkles } from "lucide-react";
import { BlueMarbleButton } from "../primitives";

export interface TranslateAskButtonProps { onClick: () => void; }

export function TranslateAskButton({ onClick }: TranslateAskButtonProps) {
  return (
    <BlueMarbleButton className="translate-ask-button" onClick={onClick}>
      <Sparkles size={25} strokeWidth={1.6} />
      Translate
    </BlueMarbleButton>
  );
}
