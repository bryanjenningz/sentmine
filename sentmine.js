var request = require('request');
var fs = require('fs');

var file = 'sentences.txt';
var rootUrl = 'http://www.chinasmack.com/page/';
var maxPageNumber = 225;
var linkRegex = /<a id="[^"]+" class="[^"]+" href="([^"]+)"/g;
var sentenceRegex = /<span title="([^"]+)">([^"]+)<\/span>/g;

fs.writeFile(file, ''); // Clear file

var filterTags = function(text) {
  return text.replace(/<[^>]+>[^<]*<[^>]+>/g, '')
             .replace(/<[^>]+>/g, '')
             .replace(/&[^;]+;/g, '\'')
             .replace(/[,\n]/g, '');
};

// Input: row (tuple [Japanese, English])
var writeRow = function(row) {
  return row.map(filterTags).join(',') + '\n';
};

var writeRows = function(rows, file) {
  var text = '';
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var entry = writeRow(row);
    if (entry.indexOf('\n,') >= 0) {
      console.log(entry);
    }
    text += entry;
  }
  fs.appendFile(file, text);
  return text;
};

var collectMatches = function(regex, string, extract) {
  extract = extract || function(match) { return match[1]; };
  var match;
  var matches = [];
  while (match = regex.exec(string)) {
    matches.push(extract(match));
  }
  return matches;
};

var collectSentences = function(pageNumber) {
  console.log(pageNumber);
  request(rootUrl + pageNumber, function(error, response, body) {
    var links = collectMatches(linkRegex, body);
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      request(link, function(error, response, articleBody) {
        var getSentences = function(match) { return match.slice(1, 3); };
        var sentences = collectMatches(sentenceRegex, articleBody, getSentences);
        writeRows(sentences, file);
      });
    }
  });
};

for (var pageNumber = 1; pageNumber <= maxPageNumber; pageNumber++) {
  setTimeout(collectSentences.bind(null, pageNumber), 10000 * pageNumber);
}
