import json
lines = open(r'C:\Users\alexe\.gemini\antigravity-cli\brain\db7b49ca-1a02-44d5-b176-cdee4978ca73\.system_generated\steps\928\content.md', encoding='utf-8').read().split('---', 1)[1].strip()
d=json.loads(lines)
def find_fel(items):
 for i in items:
  if 'item' in i: find_fel(i['item'])
  elif 'facturar' in str(i.get('request', {}).get('url')):
   print(json.dumps(i.get('request', {}).get('body', {}), indent=2))
find_fel(d.get('item',[]))
