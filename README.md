# typedoc-transformer
Tool for transforming typedoc json to other formats

## Usage

### 1. Generate a typedoc JSON file

```
cd my-project
typedoc --json output.json src/
```

### 2. Run transform

```
cd typedoc-transformer
node main.js path/to/typedoc/output.json
```