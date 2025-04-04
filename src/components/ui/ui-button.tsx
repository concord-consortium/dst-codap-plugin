import { clsx } from "clsx";
import React from "react";
import { Tooltip, PlacementWithLogical } from "@chakra-ui/react";
import "./ui-button.scss";

interface IUIButtonProps {
  active?: boolean;
  className?: string;
  disabled?: boolean;
  Icon?: any;
  onClick?: () => void;
  noActiveHover?: boolean;
  testId?: string;
  tooltip?: string;
  tooltipPlacement?: PlacementWithLogical;
}

export function UIButton({ 
  active, 
  className, 
  disabled, 
  Icon, 
  onClick, 
  noActiveHover, 
  testId,
  tooltip,
  tooltipPlacement = "right"
}: IUIButtonProps) {
  const classes = clsx("ui-button", className, { active, nohover: noActiveHover && active });
  
  const button = (
    <button className={classes} data-testid={testId} disabled={disabled} onClick={() => onClick?.()}>
      {Icon && <Icon />}
    </button>
  );
  
  if (tooltip) {
    return (
      <Tooltip label={tooltip} placement={tooltipPlacement} hasArrow>
        {button}
      </Tooltip>
    );
  }
  
  return button;
}
