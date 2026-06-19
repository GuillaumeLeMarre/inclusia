"use client";

import { useState } from "react";
import { MermaidRenderer } from "@/components/mindmaps/MermaidRenderer";

export default function MermaidTestPage() {
  const [code, setCode] = useState(`mindmap
  root((Test))
    Idée 1
    Idée 2`);

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-xl font-bold">Test Mermaid</h1>
      <textarea
        data-testid="mermaid-code-input"
        className="w-full min-h-[120px] rounded-lg border p-3 text-base font-mono"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        aria-label="Code Mermaid"
      />
      <MermaidRenderer code={code} />
    </main>
  );
}
