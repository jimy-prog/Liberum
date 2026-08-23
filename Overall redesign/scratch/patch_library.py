with open("templates/library/student_home.html", "r") as f:
    text = f.read()

# Remove duplicated title
text = text.replace('<h1 style="font-family: var(--font-d); font-size: 1.8rem; font-weight: 700; margin-bottom: 8px;">Liberum Digital Library</h1>', '')

# Add margaret thatcher podcast block at the bottom
podcast = '''
  <div class="card" style="margin-top:24px;display:flex;align-items:center;padding:16px;gap:16px;background:var(--fill)">
    <div style="width:80px;height:80px;background:var(--border);border-radius:12px;overflow:hidden;flex-shrink:0">
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Margaret_Thatcher_portrait.jpg" style="width:100%;height:100%;object-fit:cover;">
    </div>
    <div style="flex:1">
        <div style="font-weight:700;font-size:16px;color:var(--txt)">Margaret Thatcher - Iron Lady</div>
        <div style="font-size:13px;color:var(--txt3);margin-top:4px">Liberum Original Podcasts · Episode 12</div>
        <!-- audio player mock -->
        <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
            <button class="btn sm" style="width:32px;height:32px;border-radius:16px;padding:0;justify-content:center"><i data-lucide="play" style="width:14px;height:14px"></i></button>
            <div style="flex:1;height:4px;background:var(--border);border-radius:2px;position:relative">
                <div style="width:30%;height:100%;background:var(--acc);border-radius:2px"></div>
            </div>
            <div style="font-size:11px;color:var(--txt3)">12:40 / 45:00</div>
        </div>
    </div>
  </div>
'''

if 'Margaret Thatcher' not in text:
    text = text.replace('  </div>\n</div>\n{% endblock %}', '  </div>\n' + podcast + '\n</div>\n{% endblock %}')

with open("templates/library/student_home.html", "w") as f:
    f.write(text)

