#!/bin/bash
# globals.css dışında CSS dosyası oluşturmayı engeller

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

if [[ "$FILE" == *.css ]] && [[ "$FILE" != *"globals.css" ]]; then
  echo "❌ CSS dosyası oluşturulamaz: $FILE" >&2
  echo "   Stiller globals.css'e CSS variable olarak eklenmelidir." >&2
  exit 2
fi

exit 0
