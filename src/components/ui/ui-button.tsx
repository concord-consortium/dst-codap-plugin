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
  testId?: string;
}
export function UIButton({ active, className, disabled, Icon, onClick, noActiveHover, testId }: IUIButtonProps) {
  const classes = clsx("ui-button", className, { active, nohover: noActiveHover && active });
  return (
    <button className={classes} data-testid={testId} disabled={disabled} onClick={() => onClick?.()}>
      {Icon && <Icon />}
    </button>
  );
}
