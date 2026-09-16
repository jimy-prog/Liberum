with open("src/components/ui-kit.tsx", "r") as f:
    code = f.read()

code = code.replace("export function GoogleButton() {", "export function GoogleButton({ onClick }: { onClick?: () => void }) {")
code = code.replace('className="flex h-11 w-full items-center', 'onClick={onClick}\n      className="flex h-11 w-full items-center')

with open("src/components/ui-kit.tsx", "w") as f:
    f.write(code)
