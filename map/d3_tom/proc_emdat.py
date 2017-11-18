import pandas as pd
import json

fname = "data/emdat_data.csv"
fname_out = "data/emdat_data.json"

cols = ['year', 'iso', 'ctryname', 'disastertype', 'occurence',
        'deaths', 'injuries', 'affected', 'homeless',
        'affected_total', 'damage_total']

df = pd.read_csv(fname, sep=',', names=cols, header=0)
print df.shape

df = df.dropna(axis=0, subset=['deaths'])
print "shape after nan removal: {0}".format(df.shape)

df = df.groupby('disastertype')

dict_json = {}
dict_json["Storm"] = {}
dfg = df.get_group("Storm").groupby('year')

for k,v in dfg:
    if k in range(1990,2017):
        print k
        v.index = v['iso']
        dict_json['Storm'][k] = v['deaths'].to_dict()
        
with open(fname_out, 'w') as f:
    f.write(json.dumps(dict_json))

print "json saved to {0}".format(fname_out)
