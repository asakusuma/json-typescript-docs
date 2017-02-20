# typedoc-transformer
Tool for transforming typedoc json to other formats

## Usage

Usage for converting to modified JSDoc/JSON API lovechild

### 1. Generate a typedoc JSON file

```
cd my-project
typedoc --json output.json src/
```

### 2. Run transform

```
cd typedoc-transformer
node main.js path/to/typedoc.json path/to/output.json
```