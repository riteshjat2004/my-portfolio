import React from "react";
import DevVaultCommandSearch from "@/components/devvault/DevVaultCommandSearch";

export default function DevVaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DevVaultCommandSearch />
      {children}
    </>
  );
}
