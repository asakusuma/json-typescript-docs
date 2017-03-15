# typedoc-transformer
Takes a set of TypeScript projects and creates a JSON file that can be used to create an API docs site. The output file is in [JSON API](http://jsonapi.org/format/) format.

The exact format is described by a [TypeScript interface](https://github.com/asakusuma/typedoc-transformer/blob/master/src/lib/doc-interfaces.ts#L13).

```
npm install -g typedoc-transformer
```

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

Note that the `src` path is the root path of the TypeScript sources, not necessarily the project root folder.

### 2. Run transform

```
tdt my-config.json
```