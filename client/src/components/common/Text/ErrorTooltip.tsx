import React from 'react';

interface Props {
  className?: string;
  errorMessage: string | undefined;
  hasError?: boolean;
}

export const ErrorTooltip: React.FC<Props> = (props) => {
  const { className, errorMessage, hasError } = props;
  return (
    <>
      {hasError && (
        <p className={`mt-2 pl-4 font-noto text-[12px] font-medium text-start text-red-600 text-error ${className}`}>{errorMessage}</p>
      )}
    </>
  );
};
