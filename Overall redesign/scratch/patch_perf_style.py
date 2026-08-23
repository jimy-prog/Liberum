with open("templates/performance.html", "r") as f:
    text = f.read()

style_new = '''.sd-input {
  width: 36px; height: 28px;
  border-radius: 6px; border: 1px solid var(--line);
  background: transparent; color: var(--txt);
  text-align: center; font-family: var(--fm);
  font-size: 13px; font-weight: 600;
  transition: all 0.2s;
  margin: 0 auto; display: block;
}
.sd-input:focus { border-color: var(--acc); outline: none; background: var(--fill); }
/* Hide number spin buttons */
.sd-input::-webkit-outer-spin-button, .sd-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.sd-input[type=number] { -moz-appearance: textfield; }
'''

if ".sd-input {" not in text:
    text = text.replace('/* Charts */', style_new + '/* Charts */')
    with open("templates/performance.html", "w") as f:
        f.write(text)
