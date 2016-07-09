var dictionary = require('./dictionary.js')
var fs = require('fs')
var fromFile = 'japanese_sentences_july-7-2016.txt'
var toFile = 'japanese_sentences_july-7-2016_translations_2.txt'


var getTranslations = (text) => {
  var translations = []
  var start = 0
  var addedWords = {} // Keeps track of the words added so we only add each word once.
  while (start < text.length) {
    var foundTranslation = false
    for (var wordLength = Math.min(10, 1 + text.length - start); wordLength >= 1; wordLength--) {
      var word = text.slice(start, start + wordLength)
      if (dictionary[word]) {
        // If we find a word in the dictionary that was already looked up, we still want 
        // to count it as a foundTranslation so that the start variable will skip passed 
        // the end of the word so that we don't continue trying to look for smaller words,
        // because finding small words usually results in too many translations with most
        // of the translations not being very useful.
        foundTranslation = true

        if (!addedWords[word]) {
          translations.push(word + ': ' + dictionary[word].join('; ' + word + ': ').replace(/,/g, ';'))
          addedWords[word] = true
        }

        break
      }
    }

    if (foundTranslation) {
      // Go passed the end of the word that was found.
      start += wordLength
    } else {
      start += 1
    }
  }
  return translations
}


var sentences = fs.readFileSync(fromFile)
  .toString()
  .split('\n')
  .map((line, i) => {
    var [front, back, tag] = line.split(',')

    try {
      var translations = getTranslations(front)
    } catch (e) {
      console.log('Failed on line ' + (i + 1))
      return line
    }

    return [front, '  ' + back + translations.join('; '), tag].join(',')
  })
  .join('\n')


fs.writeFileSync(toFile, sentences)
