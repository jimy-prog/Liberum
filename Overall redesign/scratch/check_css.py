import re
with open('templates/base.html', 'r') as f:
    text = f.read()
style = text.split('<style>')[1].split('</style>')[0]
import cssutils
import logging
cssutils.log.setLevel(logging.FATAL)
sheet = cssutils.parseString(style)
for rule in sheet:
    if rule.type == rule.STYLE_RULE:
        if '.side' in rule.selectorText:
            print("Found .side rule")
