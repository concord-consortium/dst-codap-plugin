import { clsx } from "clsx";
import React from "react";
import "./ui-button.scss";

interface IUIButtonProps {
  active?: boolean;
  className?: string;
  disabled?: boolean;
  Icon?: any;
  onClick?: () => void;
  noActiveHover?: boolean;
}
export function UIButton({ active, className, disabled, Icon, onClick, noActiveHover }: IUIButtonProps) {
  const classes = clsx("ui-button", className, { active, nohover: noActiveHover && active });
  return (
    <button className={classes} disabled={disabled} onClick={() => onClick?.()}>
      {Icon && <Icon />}
    </button>
  );
}
