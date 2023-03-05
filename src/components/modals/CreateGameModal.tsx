import React, { useState } from "react";
import { initial } from "lodash";

type CreateGameModalProps = {
  showModal: boolean;
  title: string;
  onCrossClick: () => void;
  onCancelClick: () => void;
  onAcceptClick: () => void;
  children: React.ReactNode;
};

export const CreateGameModal: React.FC<CreateGameModalProps> = ({
  showModal = true,
  title,
  onCrossClick,
  onCancelClick,
  onAcceptClick,
  children,
}) => {
  return (
    <div className={`${
        showModal ? "" : "hidden"
    } absolute inset-0 bg-[rgba(0,0,0,0.8)]`}>
      <div
        id="small-modal"
        tabIndex={-1}
        className={`${
          showModal ? "" : "hidden"
        } fixed top-0 left-0 right-0 z-50 h-[calc(100%-1rem)] w-full overflow-y-auto overflow-x-hidden p-4`}
      >
        <div className="relative flex h-full w-full items-center md:h-auto">
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
            <div className="w-full space-y-6 p-6">
              {children}
              {/*<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">*/}
              {/*  With less than a month to go before the European Union enacts new*/}
              {/*  consumer privacy laws for its citizens, companies around the world*/}
              {/*  are updating their terms of service agreements to comply.*/}
              {/*</p>*/}
              {/*<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">*/}
              {/*  The European Union’s General Data Protection Regulation (G.D.P.R.)*/}
              {/*  goes into effect on May 25 and is meant to ensure a common set of*/}
              {/*  data rights in the European Union. It requires organizations to*/}
              {/*  notify users as soon as possible of high-risk data breaches that*/}
              {/*  could personally affect them.*/}
              {/*</p>*/}
            </div>
            {/* <!-- Modal footer --> */}
            <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
              <button
                onClick={onAcceptClick}
                data-modal-hide="small-modal"
                type="button"
                className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Create Game
              </button>
              <button
                onClick={onCancelClick}
                data-modal-hide="small-modal"
                type="button"
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
