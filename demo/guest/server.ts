// Guest workload: a minimal HTTP server whose in-memory state proves
// snapshot durability. The counter lives only in this process's memory —
// if it survives a Firecracker stop/start cycle, the memory snapshot worked.
let counter = 0;
const bootedAt = new Date().toISOString();

Bun.serve({
  port: 8000,
  hostname: "0.0.0.0",
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return new Response("ok");
    }
    counter++;
    return Response.json({
      counter,
      bootedAt,
      pid: process.pid,
    });
  },
});

console.log(`guest: bun ${Bun.version} listening on :8000 (booted ${bootedAt})`);
