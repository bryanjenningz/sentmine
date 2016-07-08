var request = require('request');
var fs = require('fs');

var file = 'sentences.txt';
var rootUrl = 'http://www.japancrush.com/page/';
var maxPageNumber = 80;
var linkRegex = /<a id="[^"]+" class="[^"]+" href="([^"]+)"/g;
var sentenceRegex = /<span title="([^"]+)">([^"]+)<\/span>/g;

fs.writeFile(file, ''); // Clear file

var cleanText = function(text) {
  return text.replace(/<[^>]+>/g, '')
             .replace(/&[^;]+;/g, '')
             .replace(/[,\n]/g, '');
};

var writeRows = function(rows, file) {
  var textRows = ''.concat.apply('', 
    rows.map((row) => row.map(cleanText).join(',') + '\n'));
  if (/,,/.test(textRows)) {
    console.log('2 commas!!! ------------------------------------------');
    var index = textRows.indexOf(',,');
    var startIndex = textRows.lastIndexOf('\n', index);
    var endIndex = textRows.indexOf('\n', index);
    console.log(textRows.slice(startIndex, endIndex + 1))
    console.log(' ----------------------------------------- ')
  }
  fs.appendFile(file, textRows);
};

var collectMatches = function(regex, string, extract) {
  extract = extract || ((match) => match[1]);
  var matches = string.match(regex);
  if (matches === null) {
    console.log('Found nothing for regex: ' + regex);
    return [];
  }
  return matches.map((link) => {
    regex.lastIndex = 0;
    return extract(regex.exec(link));
  });
};

var collectSentences = function(pageNumber) {
  console.log(pageNumber);
  request(rootUrl + pageNumber, function(error, response, body) {
    if (error) {
      console.log('Error line 43: ' + error);
      return;
    }
    var links = collectMatches(linkRegex, body);
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      (function(link) {
        request(link, function(error, response, articleBody) {
          // console.log(link);
          if (error) {
            console.log('Error line 51: ' + error);
            return;
          }
          var extractInfo = (match) => match.slice(1, 3).concat(link);
          var sentences = collectMatches(sentenceRegex, articleBody, extractInfo);
          writeRows(sentences, file);
        });
      })(link);
    }
  });
};

for (var pageNumber = 1; pageNumber <= maxPageNumber; pageNumber++) {
  setTimeout(collectSentences.bind(null, pageNumber), 20000 * (pageNumber - 1));
}
