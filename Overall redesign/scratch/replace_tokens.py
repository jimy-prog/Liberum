import re

with open('templates/base.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_root = """
/* ================= TOKENS ================= */
:root{
  --bg:#F5F5F7; --card:#FFFFFF; --card2:#FBFBFD; --fill:rgba(120,120,128,.12); --fill2:rgba(120,120,128,.18);
  --line:rgba(0,0,0,.07); --txt:#1D1D1F; --txt2:#6E6E73; --txt3:#AEAEB2;
  --acc:#7B61FF; --acc2:#6B51EF; --accbg:rgba(123,97,255,.1);
  --green:#30D158; --greenD:#1E9E4A; --red:#FF453A; --yellow:#FFD60A; --orange:#FF9F0A; --money:#1E9E4A;
  --shadow:0 1px 2px rgba(0,0,0,.04),0 8px 28px -12px rgba(0,0,0,.08);
  --r:18px; --rs:13px;
  --fd:'Space Grotesk',sans-serif; --fb:'Inter',-apple-system,sans-serif; --fm:'JetBrains Mono',monospace;
  --border: var(--line);
  --border2: rgba(0,0,0,.15);
  --text: var(--txt);
  --text2: var(--txt2);
  --text3: var(--txt3);
  --accent: var(--acc);
  --accent2: var(--acc2);
}
"""
html = re.sub(r':root\s*\{[^}]*\}', new_root, html, count=1)

new_classes = """
.side{width:250px;flex:none;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:22px 14px 14px;border-right:1px solid var(--line);background:var(--bg);z-index:40}
.brand{font-family:var(--fd);font-weight:700;font-size:23px;letter-spacing:-.03em;padding:0 12px;display:flex;align-items:center;gap:10px}
.brand span{color:var(--acc)}
.brand .dotl{width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,var(--acc),var(--acc2));display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px}
.navlbl{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--txt3);padding:14px 12px 6px}
.ni{display:flex;align-items:center;gap:11px;padding:9.5px 12px;border-radius:12px;font-size:14px;font-weight:500;color:var(--txt2);margin-bottom:2px;transition:.18s;width:100%;text-align:left;position:relative; text-decoration:none}
.ni:hover{background:var(--fill);color:var(--txt)}
.ni.on{background:var(--card);color:var(--txt);font-weight:600;box-shadow:var(--shadow)}
.ni.on::before{content:'';position:absolute;left:-14px;top:20%;bottom:20%;width:3.5px;border-radius:2px;background:var(--acc)}
.sp{flex:1}
.ucard{display:flex;align-items:center;gap:10px;background:var(--card);border-radius:14px;padding:10px 12px;box-shadow:var(--shadow);margin-top:10px}
.ucard .nm{font-size:13px;font-weight:600; color:var(--txt)}
.ucard .rl{font-size:11px;color:var(--txt2)}
.ucard .av{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;font-family:var(--fd)}
"""
html = html.replace('</style>', new_classes + '\n</style>')

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(html)
