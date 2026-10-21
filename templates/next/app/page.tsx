"use client";

import { useState } from "react";
import { Button } from "synthex-ui/button";

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <main style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
      <h1>Synthex Next Starter</h1>
      <p>Minimal Next.js App Router + synthex-ui app.</p>
      <Button onClick={() => setCount((c) => c + 1)}>
        Clicked {count} {count === 1 ? "time" : "times"}
      </Button>
    </main>
  );
}
