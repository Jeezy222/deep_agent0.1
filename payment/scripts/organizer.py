import argparse
import json
import os
from pathlib import Path
import shutil
import sys

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def is_source_dir(p: Path):
    s = str(p).replace("\\", "/")
    return "/apps/server/" in s or "/apps/web/" in s or s.endswith("/frontend/src")

def classify_target(base: Path, f: Path):
    name = f.name.lower()
    rel = f.relative_to(base)
    if rel.parts and rel.parts[0] in ("apps", "docs", "openspec", ".trae"):
        pass
    if name.endswith(".ps1"):
        return base / "scripts" / "powershell" / f.name
    if name.endswith(".bat"):
        return base / "scripts" / "windows" / f.name
    if name.endswith(".db"):
        return base / "var" / "data" / f.name
    if name.endswith(".log") or name.endswith("_log.txt"):
        return base / "var" / "log" / f.name
    if name == "kill_port.py":
        return base / "scripts" / "tools" / f.name
    if name in ("manual_test.py", "simple_test.py"):
        return base / "tests" / "manual" / f.name
    if name in ("file_test.py", "diagnostic_test.py"):
        return base / "tests" / "integration" / f.name
    if name.startswith("test_") and name.endswith(".py"):
        return base / "tests" / "integration" / f.name
    if f.suffix == ".md" and ".trae" in str(f):
        return base / "docs" / "internal" / f.name
    return None

def collect_candidates(base: Path):
    items = []
    for p in base.iterdir():
        if p.is_file():
            items.append(p)
    traedocs = base / ".trae" / "documents"
    if traedocs.exists():
        for p in traedocs.glob("*.md"):
            items.append(p)
    return items

def plan_moves(base: Path):
    moves = []
    for f in collect_candidates(base):
        tgt = classify_target(base, f)
        if tgt and tgt != f:
            moves.append((f, tgt))
    return moves

def write_log(log_path: Path, lines):
    ensure_dir(log_path.parent)
    with log_path.open("a", encoding="utf-8") as w:
        for line in lines:
            w.write(line + "\n")

def save_undo(undo_path: Path, moves):
    ensure_dir(undo_path.parent)
    data = {str(src): str(dst) for src, dst in moves}
    undo_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def apply_moves(moves):
    for src, dst in moves:
        ensure_dir(dst.parent)
        shutil.move(str(src), str(dst))

def undo_moves(undo_path: Path):
    if not undo_path.exists():
        print("UNDO file not found")
        return
    data = json.loads(undo_path.read_text(encoding="utf-8"))
    for src, dst in data.items():
        s = Path(dst)
        d = Path(src)
        if s.exists():
            ensure_dir(d.parent)
            shutil.move(str(s), str(d))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--undo", action="store_true")
    args = parser.parse_args()
    base = Path(__file__).resolve().parents[1]
    moves = plan_moves(base)
    log_path = base / "var" / "log" / "organizer.log"
    undo_path = base / "var" / "log" / "organizer.undo.json"
    if args.dry_run:
        lines = [f"DRY MOVE {src} -> {dst}" for src, dst in moves]
        for l in lines:
            print(l)
        write_log(log_path, lines)
        return
    if args.apply:
        lines = [f"MOVE {src} -> {dst}" for src, dst in moves]
        apply_moves(moves)
        write_log(log_path, lines)
        save_undo(undo_path, moves)
        print("APPLY DONE")
        return
    if args.undo:
        undo_moves(undo_path)
        print("UNDO DONE")
        return
    print("No action. Use --dry-run or --apply or --undo")

if __name__ == "__main__":
    sys.exit(main())
