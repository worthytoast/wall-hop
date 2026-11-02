"""Build Wall Hop: inlines the font and writes the web page + artifact copy + Android assets."""
import base64, pathlib, shutil
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "src" / "game.html").read_text(encoding="utf-8")
font = base64.b64encode((root / "tools" / "Bungee.ttf").read_bytes()).decode()
body = src.replace("__BUNGEE__", font)
(root / "dist").mkdir(exist_ok=True)
(root / "dist" / "artifact.html").write_text(body, encoding="utf-8")
head, _, rest = body.partition("<style>")
page = ("<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover\">\n"
        "<link rel=\"manifest\" href=\"manifest.webmanifest\">\n<link rel=\"icon\" href=\"icon-512.png\">\n"
        + head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
        + "<style>" + rest.replace("<div id=\"wrap\">", "</head>\n<body>\n<div id=\"wrap\">", 1)
        + "\n</body>\n</html>\n")
web = root / "docs"; web.mkdir(exist_ok=True)
(web / "index.html").write_text(page, encoding="utf-8")
assets = root / "android" / "app" / "src" / "main" / "assets"
assets.mkdir(parents=True, exist_ok=True)
(assets / "index.html").write_text(page.replace('<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon-512.png">\n', ""), encoding="utf-8")
print("built", len(page)//1024, "KB")
