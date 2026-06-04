import urllib.request

url = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
idx = html.find('id="Schedule"')
print('idx', idx)
if idx >= 0:
    sec = html[idx:idx+5000]
    print(sec.replace('\n', ' ')[:2000])
