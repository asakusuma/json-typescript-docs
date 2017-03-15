# json-typescript-docs
Takes a set of TypeScript projects and creates a JSON file designed to be the source of an API docs site. The output file is in [JSON API](http://jsonapi.org/format/) format.

The exact format is described by a [TypeScript interface](https://github.com/asakusuma/json-typescript-docs/blob/master/src/lib/doc-interfaces.ts#L13).

[TypeDoc](http://typedoc.org) is used under the hood. It's a better tool if you want a complete, out-of-the-box API docs solution.

### Installation

```
npm install -g json-typescript-docs
```

### Step 1: Generate a config file

See [config schema](https://github.com/asakusuma/json-typescript-docs/blob/e543724decceafe709317e4b0335fbb130ec2bb1/src/lib/cli-interfaces.ts#L5).

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

### Step 2: Run transform

```
jtd my-config.json
```