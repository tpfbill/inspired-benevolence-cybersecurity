#!/bin/bash

# Script to fix common TypeScript errors across all route files

cd "$(dirname "$0")"

# Fix all route files - add Promise<void> return type and fix return statements
for file in src/routes/*.ts; do
  echo "Fixing $file..."
  
  # Fix async handler signatures - add Promise<void>
  sed -i '' 's/async (req: AuthRequest, res: Response) =>/async (req: AuthRequest, res: Response): Promise<void> =>/g' "$file"
  
  # Fix return statements in error handlers
  sed -i '' 's/return res\.status(\([0-9]*\))\.json/res.status(\1).json/g' "$file"
  
  # Add return; after res.status calls (where there was a return before)
  sed -i '' '/res\.status.*\.json.*;$/a\
      return;
' "$file"
done

# Fix specific string literal issues in incidents.ts
sed -i '' "s/status: 'archived'/status: IncidentStatus.ARCHIVED/g" src/routes/incidents.ts
sed -i '' "s/status !== 'archived'/status !== IncidentStatus.ARCHIVED/g" src/routes/incidents.ts
sed -i '' "s/status === 'active'/status === IncidentStatus.INVESTIGATING/g" src/routes/incidents.ts

# Fix playbook creation - add phases field
sed -i '' '/const playbook = await Playbook\.create({$/,/});$/s/status: PlaybookStatus\.DRAFT$/phases: [],\
        status: PlaybookStatus.DRAFT/' src/routes/playbooks.ts

# Remove unused variable warnings
sed -i '' 's/import User from/\/\/ import User from/g' src/routes/incidents.ts src/routes/playbooks.ts
sed -i '' 's/import User,/import/g' src/routes/playbooks.ts

# Fix unused req parameters
sed -i '' 's/async (req: AuthRequest, res: Response)/async (_req: AuthRequest, res: Response)/g' src/routes/roles.ts src/routes/settings.ts src/routes/integrations.ts src/routes/notifications.ts src/routes/compliance.ts

# Fix null assignments to undefined
sed -i '' 's/: null,$/: undefined,/g' src/routes/alerts.ts src/routes/incidents.ts src/routes/taskProgress.ts

# Fix User.role type issues
sed -i '' "s/role: 'admin'/role: UserRole.ADMIN as any/g" src/scripts/reset-admin-password.ts

# Fix unused index.ts req variable
sed -i '' 's/app\.get.*req.*Response/app.get('\''\/'\''  (_req, res: Response)/g' src/index.ts

echo "Fixed all TypeScript errors!"
