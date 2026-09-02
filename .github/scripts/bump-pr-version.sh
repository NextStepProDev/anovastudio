#!/usr/bin/env bash
# Podbija VERSION na gałęzi PR-a Dependabota tak, żeby był ostro większy niż
# VERSION na main, i wypycha zmianę. Nic nie robi, jeśli gałąź już jest z przodu.
#
# Wołany z dwóch miejsc: przy otwarciu/odświeżeniu PR-a Dependabota oraz po
# każdym merge'u na main (wtedy dla wszystkich otwartych PR-ów naraz, bo merge
# jednego zabiera numer wszystkim pozostałym).
#
# Użycie: bump-pr-version.sh <nazwa-gałęzi>
set -euo pipefail

BRANCH="$1"

git fetch origin main "$BRANCH" --quiet
git checkout --quiet -B "$BRANCH" "origin/$BRANCH"

BASE=$(git show origin/main:VERSION | tr -d '[:space:]')
HEAD_VERSION=$(tr -d '[:space:]' < VERSION)

for v in "$BASE" "$HEAD_VERSION"; do
  if ! printf '%s' "$v" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo "::error title=Zły format VERSION::'$v' to nie jest X.Y.Z — podbij ręcznie."
    exit 1
  fi
done

# Ostro większy, nie "różny". Po merge'u innego PR-a gałąź i main potrafią mieć
# ten sam numer (obie strony wpisały identyczną wartość, więc git nie zgłasza
# konfliktu) — i to jest właśnie moment, w którym trzeba podbić ponownie.
HIGHEST=$(printf '%s\n%s\n' "$BASE" "$HEAD_VERSION" | sort -V | tail -1)
if [ "$HIGHEST" = "$HEAD_VERSION" ] && [ "$BASE" != "$HEAD_VERSION" ]; then
  echo "$BRANCH: VERSION $HEAD_VERSION jest już przed main ($BASE). Nic do roboty."
  exit 0
fi

MAJOR=${BASE%%.*}
REST=${BASE#*.}
MINOR=${REST%%.*}
PATCH=${REST#*.}
NEXT="${MAJOR}.${MINOR}.$((PATCH + 1))"

echo "$NEXT" > VERSION

git config user.name  'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add VERSION
git commit --quiet -m "chore: release ${NEXT}"
git push --quiet origin "HEAD:${BRANCH}"

echo "$BRANCH: VERSION $HEAD_VERSION -> $NEXT (main jest na $BASE)"
echo "### ⬆️ \`$BRANCH\`: VERSION $HEAD_VERSION → $NEXT" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
