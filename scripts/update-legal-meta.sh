#!/bin/bash
# Update legal metadata with current commit hash and date
# Usage: ./scripts/update-legal-meta.sh

echo "🔄 Updating legal metadata..."

# Get current commit hash
COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "dev-build")

# Get current date
CURRENT_DATE=$(date +"%Y-%m-%d")

# Update legalMeta.js
LEGAL_META_FILE="legal/legalMeta.js"

if [ -f "$LEGAL_META_FILE" ]; then
    # Replace commit hash placeholder
    sed -i.bak "s/__COMMIT_HASH__/$COMMIT_HASH/g" "$LEGAL_META_FILE"
    
    # Update date if needed
    sed -i.bak "s/export const LAST_UPDATED = \".*\"/export const LAST_UPDATED = \"$CURRENT_DATE\"/g" "$LEGAL_META_FILE"
    
    # Remove backup file
    rm -f "$LEGAL_META_FILE.bak"
    
    echo "✅ Updated legal metadata:"
    echo "   Commit: $COMMIT_HASH"
    echo "   Date: $CURRENT_DATE"
else
    echo "❌ Legal metadata file not found: $LEGAL_META_FILE"
    exit 1
fi

echo "🎉 Legal metadata update complete!"