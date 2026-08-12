// Owns the Firecracker process and its HTTP-over-unix-socket control API.
// Nothing here knows about boot vs. resume — that policy lives in vm.ts.
import { rmSync } from "node:fs";
import { API_SOCK } from "./config";

let fc: ReturnType<typeof Bun.spawn> | null = null;

export function firecrackerPid(): number | undefined {
  return fc?.pid;
}

/** Call the Firecracker management API (PUT /boot-source, PATCH /vm, ...). */
export async function fcApi(method: string, path: string, body?: unknown): Promise<void> {
  const res = await fetch(`http://localhost${path}`, {
    unix: API_SOCK,
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`firecracker API ${method} ${path} → ${res.status}: ${await res.text()}`);
  }
}

/** Start a fresh Firecracker process and wait until its API socket answers. */
export async function spawnFirecracker(): Promise<void> {
  rmSync(API_SOCK, { force: true });
  fc = Bun.spawn(["firecracker", "--api-sock", API_SOCK], {
    stdout: "pipe",
    stderr: "pipe",
  });
  pipeGuestConsole(fc.stdout as ReadableStream<Uint8Array>);
  pipeGuestConsole(fc.stderr as ReadableStream<Uint8Array>);

  const deadline = Date.now() + 3000;
  while (true) {
    try {
      await fetch("http://localhost/", { unix: API_SOCK });
      return;
    } catch {
      if (Date.now() > deadline) throw new Error("firecracker API socket never came up");
      await Bun.sleep(10);
    }
  }
}

export async function killFirecracker(): Promise<void> {
  if (!fc) return;
  fc.kill(9);
  await fc.exited;
  fc = null;
}

/** Forward the guest's serial console to our terminal, line by line. */
function pipeGuestConsole(stream: ReadableStream<Uint8Array>): void {
  (async () => {
    const decoder = new TextDecoder();
    let buffer = "";
    for await (const chunk of stream) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.trim()) console.log(`  [guest] ${line}`);
      }
    }
  })().catch(() => {});
}
