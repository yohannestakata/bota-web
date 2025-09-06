"use client";

import * as React from "react";

type BaseProps = {
  label?: string;
  error?: string;
  containerClassName?: string;
};

export type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> &
  BaseProps;

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, containerClassName, className, ...props }, ref) => {
    return (
      <div className={containerClassName}>
        {label ? <label className="block font-semibold">{label}</label> : null}
        <input
          ref={ref}
          className={`border-input bg-background mt-2 w-full border p-3 focus:outline-none ${className || ""}`}
          {...props}
        />
        {error ? (
          <p className="text-destructive mt-1 text-xs">{error}</p>
        ) : null}
      </div>
    );
  },
);
InputField.displayName = "InputField";

export type TextAreaFieldProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & BaseProps;

export const TextAreaField = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(
  (
    { label, error, containerClassName, className, rows = 4, ...props },
    ref,
  ) => {
    return (
      <div className={containerClassName}>
        {label ? (
          <label className="mb-2 block font-semibold">{label}</label>
        ) : null}
        <textarea
          ref={ref}
          rows={rows}
          className={`border-input bg-background w-full border p-3 focus:outline-none ${className || ""}`}
          {...props}
        />
        {error ? (
          <p className="text-destructive mt-1 text-sm">{error}</p>
        ) : null}
      </div>
    );
  },
);
TextAreaField.displayName = "TextAreaField";

export type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> &
  BaseProps;

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(
  (
    { label, error, containerClassName, className, children, ...props },
    ref,
  ) => {
    return (
      <div className={containerClassName}>
        {label ? <label className="block font-semibold">{label}</label> : null}
        <select
          ref={ref}
          className={`border-input bg-background mt-2 w-full border p-3 focus:outline-none ${className || ""}`}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p className="text-destructive mt-1 text-sm">{error}</p>
        ) : null}
      </div>
    );
  },
);
SelectField.displayName = "SelectField";

export type CheckboxFieldProps = React.InputHTMLAttributes<HTMLInputElement> &
  BaseProps;

export const CheckboxField = React.forwardRef<
  HTMLInputElement,
  CheckboxFieldProps
>(({ label, error, containerClassName, className, ...props }, ref) => {
  return (
    <div className={`flex items-center gap-2 ${containerClassName || ""}`}>
      <input
        ref={ref}
        type="checkbox"
        className={`border-gray-300 ${className || ""}`}
        {...props}
      />
      {label ? <label className="text-sm">{label}</label> : null}
      {error ? <p className="text-destructive mt-1 text-xs">{error}</p> : null}
    </div>
  );
});
CheckboxField.displayName = "CheckboxField";
