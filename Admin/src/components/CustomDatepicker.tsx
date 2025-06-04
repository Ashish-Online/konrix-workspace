// CustomDatepicker.tsx
import React, { forwardRef } from 'react';

import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

interface DatePickerInputProps {
  onClick?: () => void;
  value?: string;
  variant?: string;
  inputClass: string;
  children?: React.ReactNode;
}

/**
 * A simple custom text‐input for react-datepicker (no addon).
 */
const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  (props, ref) => {
    // We don’t actually need an onChange here; react-datepicker manages the date.
    return (
      <input
        type="text"
        className={props.inputClass}
        onClick={props.onClick}
        value={props.value || ""}
        readOnly
        ref={ref}
      />
    );
  }
);

/**
 * A custom text‐input for react-datepicker with a little calendar add-on.
 */
const DatePickerInputWithAddon = forwardRef<HTMLInputElement, DatePickerInputProps>(
  (props, ref) => {
    return (
      <div className="input-group" ref={ref}>
        <input
          type="text"
          className={props.inputClass}
          onClick={props.onClick}
          value={props.value || ""}
          readOnly
        />
        <span className={`input-group-text bg-${props.variant} border-${props.variant} text-white`}>
          <i className="ri-calendar-todo-fill fs-13" />
        </span>
      </div>
    );
  }
);

interface CustomDatepickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  hideAddon?: boolean;
  variant?: string;
  inputClass: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  tI?: number;
  timeCaption?: string;
  timeFormat?: string;
  showTimeSelectOnly?: boolean;
  monthsShown?: number;
  inline?: boolean;
}

const CustomDatepicker = (props: CustomDatepickerProps) => {
  // If props.value is undefined, we show an empty string; otherwise, call toDateString().
  const displayValue = props.value ? props.value.toDateString() : "";

  // Choose which custom‐input to render (with or without addon).
  const customInput = (props.hideAddon ?? false)
    ? (
      <DatePickerInput
        inputClass={props.inputClass}
        value={displayValue}
      />
    )
    : (
      <DatePickerInputWithAddon
        variant={props.variant}
        inputClass={props.inputClass}
        value={displayValue}
      />
    );

  return (
    <DatePicker
      customInput={customInput}
      timeIntervals={props.tI}
      selected={props.value ?? null}
      onChange={(date: Date) => props.onChange(date)}
      showTimeSelect={props.showTimeSelect}
      timeFormat={props.timeFormat || 'hh:mm a'}
      timeCaption={props.timeCaption}
      dateFormat={props.dateFormat || "MM/dd/yyyy"}
      minDate={props.minDate}
      maxDate={props.maxDate}
      monthsShown={props.monthsShown}
      showTimeSelectOnly={props.showTimeSelectOnly}
      inline={props.inline}
      autoComplete="off"
    />
  );
};

export default CustomDatepicker;
