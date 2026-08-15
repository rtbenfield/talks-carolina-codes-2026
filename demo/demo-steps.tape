# Shared steps for the Firecracker snapshot-resume recording.
# Not runnable on its own — no Output or Set commands here.
# Record via the theme variants, from this directory (demo/), with the
# setup scripts already applied (see README.md) and port 8080 free:
#
#   vhs demo-light.tape   → ../public/firecracker-demo-light.webm
#   vhs demo-dark.tape    → ../public/firecracker-demo-dark.webm
#
# Layout: a tmux session with the Bun proxy in the top pane and the curl
# commands in the bottom pane, so server logs and client output stay
# separate. The tmux setup and teardown are hidden from the recording —
# the visible commands are exactly what the README tells a reader to run
# in two terminals.

Hide
Type `tmux new-session -d -s fc-demo "PS1='$ ' bash --norc"`
Enter
Type "tmux set -t fc-demo status off"
Enter
Type "tmux set -t fc-demo pane-border-status top"
Enter
Type `tmux set -t fc-demo pane-border-format " #{pane_current_command} "`
Enter
Type `tmux set -t fc-demo default-command "PS1='$ ' bash --norc"`
Enter
Type "tmux split-window -v -t fc-demo"
Enter
Type "tmux select-pane -t fc-demo:0.0"
Enter
Type "tmux attach -t fc-demo"
Enter
Sleep 1s
Show

# Start the proxy in the top pane, in plain view.
Sleep 5s
Type "bun run src/server.ts"
Enter
Sleep 5s

# Hop to the bottom pane for the client side.
Hide
Ctrl+b
Type "o"
Sleep 500ms
Show

# First request: no VM exists yet — full cold boot.
# Keep this pause short: the pause plus the typing time of the next curl
# must stay under the 5 s idle window, or the warm request races the
# snapshot and shows "resume" instead.
Type "curl -i -w '\n\n' localhost:8080"
Enter
Sleep 3s

# Second request: VM is already running — warm path, counter increments.
Type "curl -i -w '\n\n' localhost:8080"
Enter
Sleep 5s

# Idle timeout (5 s): the proxy pauses the VM, writes a memory snapshot,
# and kills the firecracker process. Wait for the 💤 log line.
Sleep 5s

# Prove the VM process is really gone.
Type "pgrep firecracker || echo -e 'no firecracker process — the VM is gone\n'"
Enter
Sleep 5s

# Third request: restored from the memory snapshot — same counter,
# same bootedAt, a fraction of the cold-boot time. End before the next
# idle snapshot fires so the loop restarts on a clean final frame.
Type "curl -i -w '\n\n' localhost:8080"
Enter
Sleep 10s

# Teardown: SIGINT the proxy so it shuts the VM down cleanly, then drop
# the tmux session.
Hide
Type "tmux send-keys -t fc-demo:0.0 C-c"
Enter
Sleep 1.5s
Type "tmux kill-session -t fc-demo"
Enter
Sleep 1s
