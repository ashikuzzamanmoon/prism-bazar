import React from "react";

type CustomInputProps = {
  label: string;
  required?: boolean; // ← default false
} & React.InputHTMLAttributes<HTMLInputElement>;

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, required = false, ...rest }, ref) => {
    return (
      <div className="w-full">
        <label className="block mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <input
          ref={ref}
          required={required}
          className="w-full border focus:outline focus:outline-amber-400 px-4 py-2 rounded-md"
          {...rest}
        />
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";
export default CustomInput;
