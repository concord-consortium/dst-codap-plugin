import { clsx } from "clsx";
import React from "react";
import ArrowIcon from "../../assets/icons/cube-arrow-icon.svg";
import "./arrow-button.scss";

interface IArrowButtonProps {
  className?: string;
  direction: "up" | "right" | "down" | "left";
  disabled?: boolean;
  Icon?: any;
  onClick?: () => void;
}
export function ArrowButton({ className, direction, disabled, Icon, onClick }: IArrowButtonProps) {
  const ButtonIcon = Icon ?? ArrowIcon;
  return (
    <button
      className={clsx("arrow-button", className, direction)}
      data-testid={`${className}-button-${direction}`}
      disabled={disabled}
      onClick={onClick}
    >
      <ButtonIcon />
    </button>
  );
}
