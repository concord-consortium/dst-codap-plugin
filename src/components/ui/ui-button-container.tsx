import { clsx } from "clsx";
import React from "react";
import "./ui-button-container.scss";

interface IUIButtonContainerProps {
  children?: any;
  className?: string;
}
export function UIButtonContainer({ children, className }: IUIButtonContainerProps) {
  return (
    <div className={clsx("ui-button-container", className)}>
      {children}
    </div>
  );
}
