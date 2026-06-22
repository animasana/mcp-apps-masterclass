import type { GlobalProvider } from "@ladle/react";
// @ts-ignore
import "../src/index.css";

export const Provider: GlobalProvider = ({ children }) => (
    <div className="bg-surface text-primary">{children}</div>
);
