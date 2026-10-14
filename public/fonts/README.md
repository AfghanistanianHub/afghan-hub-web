# Interface typography

Persian and Pashto use **Estedad**, a screen-oriented Arabic–Latin sans-serif by Amin Abedi / Fontamin. The bundled variable font supplies real weights 100–900; interface body text uses regular and the language entrance uses medium (500). English retains Geist.

- Source: `google/fonts`, `ofl/estedad/Estedad[wght].ttf`, version 8.5.
- Immutable source Git blob: `7aaa00f285a28300a26c915cc502f425e9820d2a`.
- Upstream: https://github.com/aminabedi68/Estedad
- License: SIL Open Font License 1.1; see `OFL.txt`.
- Packaging: original glyphs/weight axis retained; lossless WOFF2 encoding with FontTools and Node's built-in Brotli (quality 11, font mode). The converted cmap was round-tripped against all 1,584 source codepoints. No new application dependency or external font service.
- Transfer size: 128,356 bytes, replacing the former 192,144-byte regular-only Noto Sans Arabic file.

Coverage was audited against Persian letters, Persian/Arabic numerals and Pashto's additional letters, including ټ ځ څ ډ ړ ږ ښ ڼ ۍ ې. Browser QA also checks that the actual chooser labels and a Pashto glyph probe render with Estedad instead of system fallback. This confirms glyph support, not native-language editorial approval.
