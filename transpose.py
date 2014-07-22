# Transposes a 2 row csv file and outputs a 2 column csv file.

import csv

filename = 's.csv'
outfile = 's2.csv'

with open(filename, 'rb') as f:
    csv_f = csv.reader(f)
    result = []
    for row in csv_f:
        result.append(row)
# assume that there are only 2 groups that we care about
result = zip(result[0], result[1])

with open(outfile, 'wb') as f:
    csv_f = csv.writer(f)
    for row in result:
        csv_f.writerow(row)
