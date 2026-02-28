#!/bin/bash
# .ts / .tsx dosyası düzenlenince TypeScript tip kontrolü çalıştırır

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

if [[ "$FILE" == *.ts ]] || [[ "$FILE" == *.tsx ]]; then
  cd /Volumes/projects/mood-doc
  RESULT=$(npx tsc --noEmit 2>&1)
  if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript hataları:" >&2
    echo "$RESULT" | head -20 >&2
  fi
fi

exit 0
