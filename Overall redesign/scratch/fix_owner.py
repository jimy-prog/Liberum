with open('templates/owner_dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("System Logs", "Recent OTPs")
text = text.replace("recent_logs", "recent_otps")
text = text.replace("log.action", "log.code + ' sent to ' + log.target")
text = text.replace("log.user_id", "channel: ' + log.channel + '")
text = text.replace("log.timestamp.strftime('%H:%M:%S')", "log.created_at[:16]")

with open('templates/owner_dashboard.html', 'w', encoding='utf-8') as f:
    f.write(text)
