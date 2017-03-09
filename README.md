# typedoc-transformer
Tool for transforming typedoc json to other formats

## Usage

Usage for converting to modified JSDoc/JSON API lovechild

### 1. Generate a config file

See [config schema](https://github.com/asakusuma/typedoc-transformer/blob/e543724decceafe709317e4b0335fbb130ec2bb1/src/lib/cli-interfaces.ts#L5).

```JSON
{
  "manifest" : {
    "title": "My docs site",
    "intro": "Everything is awesome"
  },
  "projects": [
    {
      "src": "path/to/some/project"
    }
  ],
  "output": "out.json"
}
```

### 2. Run transform

```
tdt my-config.json
```