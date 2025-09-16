# searchapi
Search api for data.jain.wiki

## Getting Started for New Developers

This project uses git submodules to include external data dependencies. Follow these steps to properly set up the development environment:

### Cloning the Repository

**Option 1: Clone with submodules in one command (recommended)**
```bash
git clone --recurse-submodules https://github.com/jain-wiki/searchapi.git
```

**Option 2: Clone repository first, then initialize submodules**
```bash
git clone https://github.com/jain-wiki/searchapi.git
cd searchapi
git submodule update --init --recursive
```

### Working with Submodules

If you've already cloned the repository without submodules, you can fetch them with:
```bash
git submodule update --init --recursive
```

To update all submodules to their latest commits:
```bash
git submodule update --remote
```

### Project Structure

- `atlas-data/` - Git submodule containing data files from [jain-wiki/atlas-data](https://github.com/jain-wiki/atlas-data)
- `src/` - Main source code directory
- `drizzle/` - Database migration files

### Development Setup

1. Ensure you have [Bun](https://bun.sh/) installed
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up the database:
   ```bash
   bun run migrate
   ```
4. Start the development server:
   ```bash
   bun run dev
   ```
