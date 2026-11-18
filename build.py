"""
Compilatore Preventivi — Build Script
Questo script compila i file sorgente modulari in `src/` nel file monolitico pronto all'uso `Compilatore-preventivi.html`.

Uso:
  python build.py
"""

import os, sys, datetime, re

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(ROOT_DIR, 'src')
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
PUBLIC_FILE = os.path.join(PUBLIC_DIR, 'index.html')

def build():
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Avvio compilazione da src/ ...")
    
    # 1. Leggi index.html base
    index_path = os.path.join(SRC_DIR, 'index.html')
    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # 2. Leggi e unisci i file CSS
    css_order = [
        'fonts.css',
        'main.css',
        'print.css',
        'dark-mode.css'
    ]
    css_combined = []
    for css_name in css_order:
        p = os.path.join(SRC_DIR, 'css', css_name)
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8') as cf:
                css_combined.append(f"/* === {css_name} === */\n" + cf.read().strip())
        else:
            print(f"Attenzione: file CSS non trovato: {p}")
            
    style_tag = "<style>\n" + "\n\n".join(css_combined) + "\n</style>"
    
    # Sostituisci i tag <link rel="stylesheet"> usando function repl per evitare errori di escape
    css_pattern = re.compile(r'<!-- Fogli di stile modulari -->.*?<link[^>]+print\.css">', re.DOTALL)
    html = css_pattern.sub(lambda m: style_tag, html)
    
    # 3. Leggi e unisci i file JS
    js_order = [
        'core.js',
        'validator.js',
        'config.js',
        'helpers.js',
        'calculations.js',
        'storage-safety.js',
        'clients.js',
        'firebase-auth.js',
        'firebase-sync.js',
        'editor.js',
        'price-list.js',
        'print-engine.js',
        'archive.js',
        'theme.js',
        'app.js'
    ]
    js_combined = []
    for js_name in js_order:
        p = os.path.join(SRC_DIR, 'js', js_name)
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8') as jf:
                js_combined.append(f"/* === {js_name} === */\n" + jf.read().strip())
        else:
            print(f"Attenzione: file JS non trovato: {p}")
            
    script_tag = "<script>\n" + "\n\n".join(js_combined) + "\n</script>"
    
    # Sostituisci i tag <script src="..."> usando function repl
    js_pattern = re.compile(r'<!-- Moduli JavaScript -->.*?<script[^>]+app\.js"></script>', re.DOTALL)
    html = js_pattern.sub(lambda m: script_tag, html)
    
    # 4. Scrivi il file di destinazione per Firebase Hosting (public/index.html) e desktop (Compilatore-preventivi.html)
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    with open(PUBLIC_FILE, 'w', encoding='utf-8') as out_pub:
        out_pub.write(html)
        
    desktop_file = os.path.join(ROOT_DIR, 'Compilatore-preventivi.html')
    with open(desktop_file, 'w', encoding='utf-8') as out_desk:
        out_desk.write(html)
        
    size_kb = os.path.getsize(PUBLIC_FILE) / 1024
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Compilazione completata con successo!")
    print(f"  -> Cartella hosting aggiornata: {PUBLIC_FILE} ({size_kb:.1f} KB)")
    print(f"  -> File desktop aggiornato: {desktop_file} ({size_kb:.1f} KB)")


if __name__ == '__main__':
    if '--test' in sys.argv:
        test_file = os.path.join(ROOT_DIR, 'test.js')
        if os.path.exists(test_file):
            print("Esecuzione suite di test automatizzati pre-build...")
            ret = os.system(f'node "{test_file}"')
            if ret != 0:
                print("ERRORE: I test sono falliti! Compilazione interrotta per sicurezza.")
                sys.exit(1)
            print("Tutti i test superati con successo!\n")
    build()
