import React from "react";
const WebWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="pt-16 max-w-screen-xl mx-auto px-4 min-h-screen min-w-screen flex flex-col bg-gradient-to-br from-[#ffffff] via-[#d084ff] to-[#cfcfcf]">
      {children}
    </div>
  );
};
export default WebWrapper;