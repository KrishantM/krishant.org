"""Build src/content/gates-demo.json from the REAL Surya Gates classifier.

Every verdict on the site's "Try Surya Gates" demo comes from running
`surya_gates.rules.classify` on the action below. Nothing is hand-written.

    npm run demo:gates
    SURYA_GATES_PATH=/path/to/surya-gates npm run demo:gates
    python3 -I scripts/build-gates-demo.py --check   # compare, don't write

--check re-runs the classifier at the recorded commit's code and exits 1 if
any verdict differs from the committed JSON. The unit tests use it.

Python 3.9 or newer, standard library only (as Surya Gates itself).
The checkout must be clean and its commit pushed, so the "source" link on
the site points at exactly the code that produced these verdicts.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "src" / "content" / "gates-demo.json"
GATES = Path(os.environ.get("SURYA_GATES_PATH", Path.home() / "Projects" / "active" / "surya-gates")).expanduser()

# The project folder the demo pretends the agent works in.
DEMO_CWD = "/workspace/app"

# id, what the agent is doing (plain words), tool name, tool input.
ACTIONS = [
    ("pytest", "Run the test suite", "Bash", {"command": "pytest -q"}),
    ("read", "Read a source file", "Read", {"file_path": "src/app.py"}),
    ("rm-build", "Clear the build folder", "Bash", {"command": "rm -rf build/"}),
    ("commit-msg", "Commit, with rm -rf in the message", "Bash", {"command": 'git commit -m "remove the rm -rf hack"'}),
    ("push", "Push to main", "Bash", {"command": "git push origin main"}),
    ("push-force", "Force-push to main", "Bash", {"command": "git push --force origin main"}),
    ("rm-src", "Delete the source folder", "Bash", {"command": "rm -rf src/"}),
    ("deploy", "Deploy to production", "Bash", {"command": "vercel --prod"}),
    ("kubectl", "Apply Kubernetes manifests", "Bash", {"command": "kubectl apply -f k8s/"}),
    ("drop-table", "Drop a database table", "Bash", {"command": 'psql -c "DROP TABLE users"'}),
    ("install", "Install a new package", "Bash", {"command": "npm install left-pad"}),
    ("email", "Send an email", "mcp__gmail__send_email", {"to": "launch list", "subject": "We're live"}),
    ("charge", "Charge a card", "Bash", {"command": "curl -X POST https://api.stripe.com/v1/charges"}),
    ("env", "Read the .env file", "Bash", {"command": "cat .env"}),
    ("gates-off", "Switch Surya Gates off", "Bash", {"command": "surya-gates text off"}),
]


def git(*args: str) -> str:
    return subprocess.run(["git", "-C", str(GATES), *args], check=True, capture_output=True, text=True).stdout.strip()


def verdicts(rules) -> list:
    out = []
    for ident, label, tool, args in ACTIONS:
        v = rules.classify(tool, args, cwd=DEMO_CWD)
        out.append({
            "id": ident,
            "label": label,
            "tool": tool,
            "input": args,
            "verdict": {
                "action": v.action,
                "class": v.cls,
                "classLabel": v.label,
                "summary": v.summary,
                "trustable": bool(v.trustable) if v.action == "stop" else None,
            },
        })
    return out


def check() -> int:
    """Re-run the classifier and compare with the committed JSON."""
    committed = json.loads(OUT.read_text())
    recorded = committed["source"]["commit"]
    # Only meaningful if the checkout's classifier code matches the recorded commit.
    diff = subprocess.run(
        ["git", "-C", str(GATES), "diff", "--quiet", recorded, "--", "surya_gates"],
        capture_output=True,
    )
    if diff.returncode != 0:
        print(f"SKIP: local surya_gates differs from {recorded[:7]}")
        return 0
    sys.path.insert(0, str(GATES))
    from surya_gates import rules  # noqa: E402

    fresh = verdicts(rules)
    if fresh != committed["actions"]:
        print("MISMATCH: gates-demo.json is not what classify() returns", file=sys.stderr)
        return 1
    print(f"MATCH: {len(fresh)} verdicts at {recorded[:7]}")
    return 0


def main() -> int:
    if not (GATES / "surya_gates" / "rules.py").exists():
        print(f"Surya Gates not found at {GATES}. Set SURYA_GATES_PATH.", file=sys.stderr)
        return 1
    if "--check" in sys.argv[1:]:
        return check()
    if git("status", "--porcelain", "--", "surya_gates"):
        print("surya_gates has uncommitted changes. Commit and push them first.", file=sys.stderr)
        return 1
    sha = git("rev-parse", "HEAD")
    pushed = subprocess.run(["git", "-C", str(GATES), "branch", "-r", "--contains", sha], capture_output=True, text=True).stdout.strip()
    if not pushed:
        print(f"Commit {sha[:7]} is not on any remote branch. Push it first.", file=sys.stderr)
        return 1

    sys.path.insert(0, str(GATES))
    from surya_gates import rules  # noqa: E402  (imported from the checkout above)

    version = ""
    pyproject = GATES / "pyproject.toml"
    for line in pyproject.read_text().splitlines():
        if line.strip().startswith("version"):
            version = line.split("=", 1)[1].strip().strip('"')
            break

    out = verdicts(rules)

    data = {
        "note": "Real output from Surya Gates. Generated by scripts/build-gates-demo.py. Do not edit by hand.",
        "generatedAt": date.today().isoformat(),
        "source": {
            "repo": "KrishantM/surya-gates",
            "version": version,
            "commit": sha,
            "url": f"https://github.com/KrishantM/surya-gates/blob/{sha}/surya_gates/rules.py",
            "function": "surya_gates.rules.classify",
            "cwd": DEMO_CWD,
        },
        "actions": out,
    }
    OUT.write_text(json.dumps(data, indent=2) + "\n")
    print(f"wrote {len(out)} verdicts from surya-gates {version} @ {sha[:7]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
