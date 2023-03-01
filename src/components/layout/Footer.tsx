import React from "react";

export const Footer = () => {
  return (
    <footer className="container mx-auto px-4 pb-4 shadow sm:px-0">
      <hr className="mb-4 border-gray-200 border-gray-700" />
      <span className="block text-center text-xs text-gray-400">
        ©2023{" "}
        <a href="https://arnthordadi.github.io" className="hover:underline">
          ArnthorDadi™
        </a>
        . All Rights Reserved.
      </span>
    </footer>
  );
};

export const Footer_one = () => {
  return (
    <footer className="m-4 bg-white shadow dark:bg-gray-900 md:px-6 md:pb-8">
      <div className={""}>
        <hr className="mb-6 border-gray-200 dark:border-gray-700 sm:mx-auto lg:mb-8" />
        <span className="block text-sm text-gray-500 dark:text-gray-400 sm:text-center">
          © 3{" "}
          <a href="https://flowbite.com/" className="hover:underline">
            Flowbite™
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};
