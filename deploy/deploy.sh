#!/usr/bin/env bash
set -Eeuo pipefail
umask 022
ACTION=${1:-help}
BASE=${2:?Usage: deploy.sh deploy|rollback|status directory [version] [archive]}
[[ "$BASE" =~ ^/[a-zA-Z0-9/_-]+$ && "$BASE" != / ]] || exit 1
mkdir -p -- "$BASE/releases"
BASE=$(realpath -e -- "$BASE")
RELEASES=$(realpath -e -- "$BASE/releases")
[[ "$RELEASES" == "$BASE/releases" ]] || { echo 'Releases must not be a symlink'; exit 1; }
exec 9>"$BASE/.publish.lock"
flock -n 9 || { echo 'Another publication is running'; exit 1; }
resolve_release() {
  local target
  target=$(realpath -e -- "$1") || return 1
  [[ "$(dirname -- "$target")" == "$RELEASES" && -f "$target/.scaffold-static" && -s "$target/index.html" ]] || return 1
  printf '%s' "$target"
}
switch_to() {
  local target=$1 old=''
  if [[ -e "$BASE/current" && ! -L "$BASE/current" ]]; then echo 'current must be a symbolic link'; exit 1; fi
  if [[ -L "$BASE/current" ]]; then old=$(resolve_release "$BASE/current"); fi
  if [[ -n "$old" && "$old" != "$target" ]]; then
    ln -s "$old" "$BASE/.previous.$$"
    mv -Tf -- "$BASE/.previous.$$" "$BASE/previous"
  fi
  ln -s "$target" "$BASE/.current.$$"
  mv -Tf -- "$BASE/.current.$$" "$BASE/current"
}
case "$ACTION" in
  deploy)
    VERSION=${3:?Version required}
    ARCHIVE=${4:?Archive required}
    [[ "$VERSION" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,79}$ ]] || exit 1
    target="$RELEASES/$VERSION"
    [[ ! -e "$target" && ! -L "$target" ]] || { echo 'Version exists; choose a new version'; exit 1; }
    # Accept only relative regular files and directories from the Jenkins-produced archive.
    tar -tzf "$ARCHIVE" | while IFS= read -r name; do
      [[ "$name" != /* && ! "$name" =~ (^|/)\.\.(/|$) ]] || exit 1
    done
    tar -tvzf "$ARCHIVE" | while IFS= read -r line; do
      [[ "$line" == -* || "$line" == d* ]] || exit 1
    done
    mkdir -- "$target"
    tar -xzf "$ARCHIVE" --no-same-owner --no-same-permissions -C "$target"
    [[ -s "$target/index.html" ]] || { echo 'Missing index.html; existing site preserved'; exit 1; }
    chmod -R u=rwX,go=rX -- "$target"
    touch "$target/.scaffold-static"
    switch_to "$target"
    # Protect current and previous even if their timestamps are older.
    previous=$(realpath -e -- "$BASE/previous" 2>/dev/null || true)
    count=1
    [[ -z "$previous" || "$previous" == "$target" ]] || count=2
    while IFS= read -r -d '' entry; do
      candidate="$RELEASES/${entry#* }"
      [[ "$candidate" != "$target" && "$candidate" != "$previous" && ! -L "$candidate" && -f "$candidate/.scaffold-static" ]] || continue
      [[ "$(realpath -e -- "$candidate")" == "$RELEASES/$(basename -- "$candidate")" ]] || continue
      if ((count < 5)); then
        count=$((count+1))
      elif ! rm -rf -- "$candidate"; then
        echo "Publication succeeded, but cleanup failed: $candidate" >&2
      fi
    done < <(find "$RELEASES" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %f\0' | sort -z -nr)
    echo "Published $VERSION"
    ;;
  rollback)
    if [[ -n "${3:-}" ]]; then
      [[ "$3" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,79}$ ]] || exit 1
      target=$(resolve_release "$RELEASES/$3")
    else target=$(resolve_release "$BASE/previous"); fi
    switch_to "$target"
    echo "Restored $(basename -- "$target")"
    ;;
  status) readlink -- "$BASE/current"; readlink -- "$BASE/previous" || true ;;
  *) echo 'Usage: deploy.sh deploy|rollback|status directory [version] [archive]'; exit 1 ;;
esac
