const mappings = {
    name: true,
    shortName: 'name',
    file: (obj) => obj.sources.fileName,
    line: (obj) => obj.sources.line,
    description: (obj) => obj.comment && obj.comment.text,
    access: (obj) => obj.flags && obj.flags.isPrivate ? 'private' : 'public', // need to handle protected
    itemtype: 'kindString'
}


function transformExport(input) {
    let output = {
        methods: [],
        events: [],
        properties: []
    };
    for (let key in mappings) {
        let value = mappings[key];
        if (value === true) {
            output[key] = input[key];
        } else if (typeof value === 'string') {
            output[key] = input[value];
        } else if (typeof value === 'function') {
            output[key] = value(input);
        }
    }

    if (input.children) {
        input.children.forEach((child) => {
            const transformed = transformExport(child);
            if (child.kindString === 'Method') {
                output.methods.push(transformed);
            } else if (child.kindString === 'Property') {
                output.properties.push(transformed);
            }
        });
    }
    return output;
}

module.exports = function transform(input) {
    let output = {
        name: input.name,
        type: 'project',
        modules: input.children.map(transformExport)
    };

    return output;
};