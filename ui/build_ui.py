# Assemble ui/kickstart_plugin.html à partir de ui/src/ (en-tête + moteur + interface)
from pathlib import Path
src = Path(__file__).parent / "src"
html = (src / "plugin-head.html").read_text(encoding="utf-8") + (src / "engine.js").read_text(encoding="utf-8") \
     + (src / "plugin-ui.js").read_text(encoding="utf-8") + "\n</script>\n</body>\n</html>\n"
(Path(__file__).parent / "kickstart_plugin.html").write_text(html, encoding="utf-8")
print("ui/kickstart_plugin.html :", len(html), "octets")
