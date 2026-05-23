import { useState } from "react";
import type {
  ReactNode,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Eye, EyeOff } from "lucide-react";

// --- Layout Components ---

export function FormSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 mb-8">
      {title && (
        <h4 className="text-xs font-semibold text-indigo-600/90 tracking-wide ml-1">
          {title}
        </h4>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4">{children}</div>;
}

// --- Basic Elements ---

export function FormLabel({
  children,
  required,
  htmlFor,
}: {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium text-slate-600 mb-1.5 ml-1"
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export function FormHelperText({
  children,
  isError,
}: {
  children: ReactNode;
  isError?: boolean;
}) {
  return (
    <p
      className={`mt-1.5 text-[10px] font-medium ml-1 leading-tight ${isError ? "text-red-500" : "text-slate-400/90"}`}
    >
      {children}
    </p>
  );
}

// --- Inputs ---

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
}

export function FormInput({
  label,
  helper,
  error,
  required,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const isInvalid = !!error;
  const isPasswordType = props.type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const finalType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : props.type || "text";

  return (
    <div className="w-full">
      {label && (
        <FormLabel required={required} htmlFor={inputId}>
          {label}
        </FormLabel>
      )}
      <div className="relative w-full">
        <input
          id={inputId}
          className={`w-full px-4 py-3.5 bg-slate-50 border ${isInvalid ? "border-red-300 focus:ring-red-500 bg-red-50/30" : "border-slate-200 focus:ring-indigo-500"} rounded-2xl focus:bg-white focus:ring-2 outline-none text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 focus-visible:ring-2 ${isPasswordType ? "pr-12" : ""} ${className}`}
          aria-invalid={isInvalid}
          aria-describedby={error || helper ? `${inputId}-desc` : undefined}
          {...props}
          type={finalType}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 active:scale-95 transition-all rounded-lg focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {(error || helper) && (
        <div id={`${inputId}-desc`}>
          <FormHelperText isError={isInvalid}>{error || helper}</FormHelperText>
        </div>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
}

export function FormTextarea({
  label,
  helper,
  error,
  required,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const isInvalid = !!error;

  return (
    <div className="w-full">
      {label && (
        <FormLabel required={required} htmlFor={textareaId}>
          {label}
        </FormLabel>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-4 py-3.5 bg-slate-50 border ${isInvalid ? "border-red-300 focus:ring-red-500 bg-red-50/30" : "border-slate-200 focus:ring-indigo-500"} rounded-2xl focus:bg-white focus:ring-2 outline-none text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 min-h-[100px] resize-none focus-visible:ring-2 ${className}`}
        aria-invalid={isInvalid}
        aria-describedby={error || helper ? `${textareaId}-desc` : undefined}
        {...props}
      />
      {(error || helper) && (
        <div id={`${textareaId}-desc`}>
          <FormHelperText isError={isInvalid}>{error || helper}</FormHelperText>
        </div>
      )}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
}

export function FormSelect({
  label,
  helper,
  error,
  required,
  children,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const isInvalid = !!error;

  return (
    <div className="w-full">
      {label && (
        <FormLabel required={required} htmlFor={selectId}>
          {label}
        </FormLabel>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full px-4 py-3.5 bg-slate-50 border ${isInvalid ? "border-red-300 focus:ring-red-500 bg-red-50/30" : "border-slate-200 focus:ring-indigo-500"} rounded-2xl focus:bg-white focus:ring-2 outline-none text-sm font-semibold text-slate-900 transition-all appearance-none focus-visible:ring-2 ${className}`}
          aria-invalid={isInvalid}
          aria-describedby={error || helper ? `${selectId}-desc` : undefined}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {(error || helper) && (
        <div id={`${selectId}-desc`}>
          <FormHelperText isError={isInvalid}>{error || helper}</FormHelperText>
        </div>
      )}
    </div>
  );
}

// --- Toggle ---

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helper?: string;
}

export function FormToggle({ label, checked, onChange, helper }: ToggleProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => onChange(!checked)}
        className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
      >
        <span className="text-sm font-medium text-slate-650">{label}</span>
        <div
          className={`w-12 h-6 rounded-full transition-colors relative ${checked ? "bg-indigo-600" : "bg-slate-300"}`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? "left-7" : "left-1"}`}
          />
        </div>
      </div>
      {helper && <FormHelperText>{helper}</FormHelperText>}
    </div>
  );
}
