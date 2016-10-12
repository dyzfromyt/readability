var readability = require('./index');
var Readability = readability.Readability;
var JSDOMParser = readability.JSDOMParser;

function extract(sourceHTML) {
    try {
        var doc = useJSDom(sourceHTML);
        if(!doc) {
            return null;
        }

        var uri = {
            spec: 'http://fakehost/test/page.html',
            host: 'fakehost',
            prePath: 'http://fakehost',
            scheme: 'http',
            pathBase: 'http://fakehost/test/'
        };

        var myReader = new Readability(uri, doc);
        var readerable = myReader.isProbablyReaderable();
        result = myReader.parse();
        var content = result.content;
        delete result.content;
        console.log(result);
        return content;
    } catch (err) {
        console.error(err, 'failed to reformat');
        return null;
    }
}

function useJSDOMParser(sourceHTML) {
    var parser = new JSDOMParser();
    var doc = parser.parse(sourceHTML);
    if (parser.errorState) {
        console.error('Parsing this DOM caused errors:', parser.errorState);
        return null;
    }
    return doc;
}

function removeCommentNodesRecursively(node) {
  for (var i = node.childNodes.length - 1; i >= 0; i--) {
    var child = node.childNodes[i];
    if (child.nodeType === child.COMMENT_NODE) {
      node.removeChild(child);
    } else if (child.nodeType === child.ELEMENT_NODE) {
      removeCommentNodesRecursively(child);
    }
  }
}

function useJSDom(sourceHTML) {
    var jsdom = require('jsdom').jsdom;
    var doc = jsdom(sourceHTML, {
        features: {
            FetchExternalResources: false,
            ProcessExternalResources: false
        }
    });
    removeCommentNodesRecursively(doc);
    return doc;
}

if (process.argv.length < 3) {
    console.log('node extract.js <html file>');
    process.exit(-1);
}

var fileName = process.argv[2]

console.log('extracting', fileName);

var fs = require('fs');
var sourceHTML = fs.readFileSync(fileName, 'utf-8');
var simplifiedHTML = extract(sourceHTML);
fs.writeFileSync(fileName + '.readable.html', simplifiedHTML, 'utf-8');
