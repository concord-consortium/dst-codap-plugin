import { clsx } from "clsx";
import React from "react";
import "./ui-button.scss";
import "./ui-split-button.scss";

interface IUISplitButtonProps {
  className?: string;
  className1?: string;
  className2?: string;
  disabled1?: boolean;
  disabled2?: boolean;
  Icon1?: any;
  Icon2?: any;
  onClick1?: () => void;
  onClick2?: () => void;
  testId1?: string;
  testId2?: string;
}
export function UISplitButton({
  className, className1, className2, disabled1, disabled2, Icon1, Icon2, onClick1, onClick2, testId1, testId2
}: IUISplitButtonProps) {
  const classes = clsx("ui-button split-button", className);
  return (
    <div className={classes}>
      <button
        className={clsx("sub-button", className1)}
        data-testid={testId1}
        disabled={disabled1}
        onClick={() => onClick1?.()}
      >
        {Icon1 && <Icon1 />}
      </button>
      <button
        className={clsx("sub-button", className2)}
        data-testid={testId2}
        disabled={disabled2}
        onClick={() => onClick2?.()}
      >
        {Icon2 && <Icon2 />}
      </button>
    </div>
  );
}
