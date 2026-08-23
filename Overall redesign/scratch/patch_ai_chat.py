with open("templates/library/student_ai_chat.html", "r") as f:
    text = f.read()

# Add go back button and hamburger menu to the top left of the chat area, and center the input.
# The user wants "Go back" button. Let's add it in the .ai-sidebar-header
if "Go Back" not in text:
    old_header = '<div class="ai-sidebar-header">'
    new_header = '<div class="ai-sidebar-header">\n  <button class="btn ghost sm block" style="margin-bottom:16px;justify-content:flex-start" onclick="window.location=\'/library/\'"><i data-lucide="arrow-left"></i>Go Back</button>'
    text = text.replace(old_header, new_header)

# The user wants to hide sidebar and center input.
# The input is probably in a container. Let's add a hamburger menu to toggle sidebar.
old_ai_main = '<div class="ai-main">'
new_ai_main = '''<div class="ai-main">
  <button id="toggleAiSidebar" class="btn ghost sm" style="position:absolute;top:20px;left:20px;z-index:100"><i data-lucide="menu"></i></button>
  <style>
    .ai-sidebar { transition: width 0.3s, padding 0.3s, opacity 0.3s; overflow:hidden; }
    .ai-sidebar.collapsed { width: 0; padding: 0; opacity: 0; }
  </style>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
        let btn = document.getElementById("toggleAiSidebar");
        if(btn) {
            btn.onclick = function() {
                let sb = document.querySelector(".ai-sidebar");
                if(sb) sb.classList.toggle("collapsed");
            };
        }
    });
  </script>
'''
text = text.replace(old_ai_main, new_ai_main)

# Centering the input:
# Often it's max-width:800px; margin: 0 auto; Let's make sure `.ai-chat-input-wrapper` is centered.
# Already done by CSS mostly.

with open("templates/library/student_ai_chat.html", "w") as f:
    f.write(text)

