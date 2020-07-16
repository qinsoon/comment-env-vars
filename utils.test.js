const parseBody = require('./utils').parseBody;
const mergeObjects = require('./utils').mergeObjects;

describe("parseBody", () => {
    test('parse', () => {
        expect(parseBody('t1\nFoo=1', 't1')).toMatchObject({
            Foo: "1",
        });
    });
    
    test('unmatched trigger word', () => {
        expect(parseBody('t2\nFoo=1', 't1')).toMatchObject({});
    });
    
    test('mix delimeters', () => {
        expect(parseBody('t1\r\nFoo=1,\rBar=2\nBaz=3,\n', 't1')).toMatchObject({
            Foo: "1",
            Bar: "2",
            Baz: "3",
        });
    });

    test('arbitrary spaces', () => {
        expect(parseBody('t1 \r\n Foo=1  ,\rBar= 2, \nBaz=3, \n ', 't1')).toMatchObject({
            Foo: "1",
            Bar: "2",
            Baz: "3",
        });
    })

    test('no trigger word', () => {
        expect(parseBody('Foo=1,Bar=2')).toMatchObject({
            Foo: "1",
            Bar: "2",
        });
    });

    test('empty', () => {
        expect(parseBody('')).toMatchObject({});
        expect(parseBody(null)).toMatchObject({});
    });
});


describe("mergeObjects", () => {
    test('non conflict keys', () => {
        expect(mergeObjects({ Foo: "1" }, { Bar: "2" })).toMatchObject({
            Foo: "1",
            Bar: "2",
        });
    });

    test('overwrite keys', () => {
        expect(mergeObjects({ Foo: "1" }, { Foo: "2" })).toMatchObject({
            Foo: "2",
        });
    });

    test('overwrite is empty', () => {
        expect(mergeObjects({ Foo: "1" }, {})).toMatchObject({
            Foo: "1",
        });
    });

    test("default is empty", () => {
        expect(mergeObjects({}, { Foo: "1" })).toMatchObject({
            Foo: "1",
        });
    });

    test('keep, overwrite and append', () => {
        expect(mergeObjects({ Foo: "1", Bar: "2" }, { Foo: "11", "Baz": "3" })).toMatchObject({
            Foo: "11",
            Bar: "2",
            Baz: "3",
        });
    })
});
