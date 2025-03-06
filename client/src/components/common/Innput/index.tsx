import React, { ForwardRefRenderFunction, forwardRef } from 'react';
import c from 'clsx';
// import s from './style.module.sass';
import { CSSProperties } from 'react';

type Props = {
  className?: string;
  style?: CSSProperties;
  type?: 'text' | 'month' | 'date' | 'email';
  onChange?: () => void;
  placeholder?: string;
  value?: string;
  hasError?: boolean;
};

const Input: ForwardRefRenderFunction<HTMLInputElement, Props> = (props, ref) => {
  const { className, style, type = 'text', onChange, placeholder, value, hasError } = props;

  const inputClassName = c(className, {
    '!border-2': hasError,
    '!border-error': hasError,
  });

  return (
    <input
      ref={ref}
      type={type}
      className={inputClassName}
      style={style}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
    />
  );
};

const ForwardedInput = forwardRef(Input);

export default ForwardedInput;
