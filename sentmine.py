# Scrapes websites for L1 and L2 content then aligns them up.
# User specifies the L1 and L2 patterns as well as the website
# and program returns all sentences in csv format.
# L1 = English, L2 = Chinese

import urllib2
import re
import csv
import time

def collect_urls(base_url):
    urls = []
    page = 1
    pattern = r'<div class="excerpt-post-thumb">\s*<a href="(.*?)"'
    for page in range(1, 205):
        url_content = urllib2.urlopen(base_url + str(page)).read()
        article_urls = re.findall(pattern, url_content)
        for url in article_urls:
            print url
            urls.append(url)
        print '--------------' + str(page) + '--------------'
    return urls

def clean_text(s):
    while '<' in s:
        s = re.findall('(.*?)<.*>', s)
        s = ''.join(s)
    return s.replace('&#8217;', '\'').replace('&#8220;', '?').replace('&#8230;', '...')

def get_sentences(urls):
    en_sentences = []
    ch_sentences = []
    pattern = r'<span title="(.*?)</span>'
    ch_pattern = r'^(.*?)">'
    en_pattern = r'">(.*)$'
    for url in urls:
        web_text = urllib2.urlopen(url).read()
        sentences = re.findall(pattern, web_text)
        for sentence in sentences:
            try:
                en_sentence = re.findall(en_pattern, sentence)[0]
                en_sentence = clean_text(en_sentence)
                ch_sentence = re.findall(ch_pattern, sentence)[0]
                en_sentences.append(en_sentence)
                ch_sentences.append(ch_sentence)
            except:
                pass
    return en_sentences, ch_sentences

def main():
    # Step 1: get all language article urls
    # Step 2: collect all Chinese and English sentences
    # Step 3: export all Chinese and English sentences to a csv file
    
    start = time.time()
    base_url = 'http://www.chinasmack.com/page/'
    urls = collect_urls(base_url)
    en_sentences, ch_sentences = get_sentences(urls)

    with open('/cygdrive/c/Users/Bryan/Desktop/sentences.csv', 'w') as f:
        f_csv = csv.writer(f)
        f_csv.writerow(ch_sentences)
        f_csv.writerow(en_sentences)

    end = time.time()
    print 'Elapsed time: {0} seconds.'.format(str(end - start))

if __name__ == '__main__':
    main()
