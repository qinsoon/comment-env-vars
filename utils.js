// Expect a body of key-value pairs, such as Foo=a, 
// separated by line breaks and comma(,)
// If trigger is not null, we expect the body to start with the trigger word, otherwise return an empty object.
function parseBody(body, trigger) {
    // Return as an object/dict
    const ret = {};

    if (!body) {
        return ret;
    }
    
    // Remove trigger from the start of the body
    if (trigger) {
        if (!body.startsWith(trigger)) {
            console.error('Only a string that starts with the trigger word can be parsed.');
            return ret;
        }
        body = body.substring(trigger.length);
    }

    const keyValues = body.split(/[\n\r,]/);
    console.log(keyValues)
    keyValues.forEach((str) => {
        console.log(str)
        const split = str.split('=');
        console.log(split)
        if (split.length == 2) {
            const key = split[0].trim();
            const value = split[1].trim();
            ret[key] = value;
        }
    });
    return ret;
}

// Merge two objects. 
function mergeObjects(default_, overwrite) {
    return Object.assign({}, default_, overwrite);
}

module.exports = {
    parseBody,
    mergeObjects,
};
