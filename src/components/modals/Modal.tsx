import React from "react";
import { Button, ButtonTypes } from "@/components/button/Button";

export type ModalProps = {
  showModal: boolean;
  title: string;
  acceptButtonText: string;
  cancelButtonText: string;
  onCrossClick: () => void;
  onCancelClick: () => void;
  onAcceptClick: () => void;
  children: React.ReactNode;
};

export const Modal: React.FC<ModalProps> = ({
  showModal = false,
  title,
  onCrossClick,
  onCancelClick,
  onAcceptClick,
  acceptButtonText,
  cancelButtonText,
  children,
}) => {
  return (
    <div
      className={`${
        showModal ? "" : "hidden"
      } absolute inset-0 bg-[rgba(0,0,0,0.8)]`}
    >
      <div
        id="small-modal"
        tabIndex={-1}
        className={`${
          showModal ? "" : "hidden"
        } fixed top-0 left-0 right-0 z-50 h-[calc(100%-1rem)] w-full overflow-y-auto overflow-x-hidden p-4`}
      >
        <div className="relative flex h-full w-full items-center ">
          {/* <!-- Modal content --> */}
          <div className="relative w-full rounded-lg bg-white shadow dark:bg-gray-700">
            {/* <!-- Modal header --> */}
            <div className="flex w-full items-center justify-between rounded-t border-b p-5 dark:border-gray-600">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                type="button"
                onClick={onCrossClick}
                className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="small-modal"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* <!-- Modal body --> */}
            <div className="w-full space-y-6 p-6">{children}</div>
            {/* <!-- Modal footer --> */}
            <div className="flex items-center justify-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
              <Button
                onClick={onCancelClick}
                text={cancelButtonText}
                type={ButtonTypes.Ghost}
              />
              <Button onClick={onAcceptClick} text={acceptButtonText} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
