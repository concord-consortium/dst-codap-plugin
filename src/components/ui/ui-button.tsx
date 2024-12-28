import { clsx } from "clsx";
import React from "react";
import "./ui-button.scss";

interface IUIButtonProps {
  className?: string;
  disabled?: boolean;
  Icon?: any;
  onClick?: () => void;
}
export function UIButton({ className, disabled, Icon, onClick }: IUIButtonProps) {
  return (
    <button className={clsx("ui-button", className)} disabled={disabled} onClick={() => onClick?.()}>
      {Icon && <Icon />}
    </button>
  );
}
