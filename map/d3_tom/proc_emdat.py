import pandas as pd
import json

fname = "data/AIDS_DEATHS.csv"
fname_out = "data/AIDS_DEATHS.json"

cols = ['country','id','Subgroup','Year','Source','Unit','Value','Value Footnotes']

df = pd.read_csv(fname, sep=',', names=cols, header=0)
print (df.shape)

df = df.dropna(axis=0, subset=['Value'])
print ("shape after nan removal: {0}".format(df.shape))

#df = df.groupby('disastertype')

dict_json = {}
#dict_json["Storm"] = {}
dict_json["Deaths"] = {}
#dfg = df.get_group("Storm").groupby('year')
dfg = df.groupby('Year')

for k,v in dfg:
    if k in range(1990,2015):
        print (k)
        v.index = v['id']
        dict_json['Deaths'][k] = v['Value'].to_dict()
        
with open(fname_out, 'w') as f:
    f.write(json.dumps(dict_json))

print ("json saved to {0}".format(fname_out))
