import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>Coding Interview Platform</h1>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
