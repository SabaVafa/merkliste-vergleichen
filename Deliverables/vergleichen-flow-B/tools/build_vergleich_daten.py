# -*- coding: utf-8 -*-
"""
Baut vergleich-daten.js (window.MTZ_VGL_DATA) fuer den Vergleich in Version B
aus dem Shop-Export "vergleich-briefkasten-sprechanlagen-<datum>.json".

Aufruf (aus diesem Ordner oder von ueberall):
    python -I build_vergleich_daten.py                    # Standard-Pfade
    python -I build_vergleich_daten.py --src <export.json> --out <vergleich-daten.js>
    python -I build_vergleich_daten.py --report <bericht.md>   # zusaetzlich Abdeckung + Datenluecken

Regeln (siehe Deliverables/11_Vergleich-Datenqualitaet.md):
  * Wawi-Merkmale, Masse und Gewicht = verlaesslich, werden 1:1 (normalisiert) uebernommen.
  * specsFromDescription = aus Beschreibungstext extrahiert -> nur uebernommen, wenn plausibel;
    widerspruechliche Werte stehen in SUPPRESS und werden NICHT ausgespielt.
  * Nichts wird ergaenzt oder geraten: fehlt ein Wert, steht er als null in der Datei (UI: "k. A.").
"""
import argparse
import collections
import json
import re
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
B_DIR = os.path.dirname(HERE)                                   # vergleichen-flow-B
ROOT = os.path.dirname(os.path.dirname(B_DIR))                  # Bookmark & Comparing
DEF_SRC = os.path.join(ROOT, 'Catalogue merkmale', 'vergleich-briefkasten-sprechanlagen-2026-11-02.json')
DEF_OUT = os.path.join(B_DIR, 'vergleich-daten.js')
DEF_IMG = os.path.join(HERE, 'shop-bilder.json')   # Hauptbild je Artikel (aus den Shop-Produktseiten, der Export hat keine Bilder)
IMG_BASE = 'https://edelstahl-tuerklingel.de/media/image/product/'

# ---------------------------------------------------------------------------
# 1) Zuordnung Prototyp-Artikel -> Shop-Artikel (id), Sicherheit, Anmerkung
#    variant = Artikelnummer einer Variante, wenn der Prototyp genau eine Ausfuehrung zeigt.
#    Reihenfolge und Umfang = Live-Kategorien /tuersprechanlagen (41 Artikel) und /briefkasten (79 Artikel),
#    Stand 05.11.2026 (Deliverables/13_PLP_Live-Abgleich.md). Bestehende Prototyp-IDs bleiben (Deep-Links,
#    gespeicherte Merklisten, Vergleichs-Tour); neue Artikel sind per Shop-ID zugeordnet ("hoch").
# ---------------------------------------------------------------------------
MAP = {
    'sprechanlage': {
        'sdm10x': (40132, 'hoch', ''),
        'colson1': (31101, 'hoch', ''),
        'dominik1': (45248, 'hoch', 'Name identisch (XDM10 · Maxior · 1 Taster); die Prototyp-ID „dominik1" ist irreführend'),
        'horizon': (36478, 'hoch', ''),
        'sdm10h': (42955, 'hoch', ''),
        'kian1': (31086, 'hoch', ''),
        'niko1': (40484, 'hoch', ''),
        'neo1': (40373, 'hoch', 'Einzelgerät, nicht das Komplettset VDM10-NEO-1T-Set'),
        'sdm10s': (44643, 'hoch', ''),
        'domaudio1': (41096, 'hoch', ''),
        'colson2': (31122, 'hoch', ''),
        'kai1': (42899, 'hoch', ''),
        'kian2': (31315, 'hoch', ''),
        'niko2': (40492, 'hoch', ''),
        'neo2': (40380, 'hoch', ''),
        'kai2': (42911, 'hoch', ''),
        'maxior2': (45256, 'hoch', ''),
        'colson3': (31135, 'hoch', ''),
        'kian3': (31321, 'hoch', ''),
        'niko3': (40501, 'hoch', ''),
        'neo3': (40387, 'hoch', ''),
        'kai3': (42918, 'hoch', ''),
        'maxior3': (45263, 'hoch', ''),
        'colson4': (38941, 'hoch', ''),
        'neo4': (40394, 'hoch', ''),
        'kai4': (42891, 'hoch', ''),
        'colson5': (38947, 'hoch', ''),
        'neo5': (40411, 'hoch', ''),
        'kai5': (42892, 'hoch', ''),
        'colson6': (38953, 'hoch', ''),
        'neo6': (40418, 'hoch', ''),
        'kai6': (42893, 'hoch', ''),
        'colson7': (38959, 'hoch', ''),
        'vdm10-bk1': (39718, 'hoch', ''),
        'bispo2-lan': (45465, 'hoch', ''),
        'zivo2-bus': (45564, 'hoch', ''),
        'zivo2-lan': (45337, 'hoch', ''),
        'vdm10-pb': (37175, 'hoch', 'Artikelnummer VDM10-PBOX'),
        'siebert-vdm10': (36045, 'hoch', ''),
        'siebert-vdm10-stand': (36050, 'hoch', ''),
        'vdm10-siebert-set': (36299, 'hoch', ''),
    },
    'briefkasten': {
        'siebert': (36621, 'hoch', ''),
        'ebenhard': (36620, 'hoch', ''),
        'hermann': (36619, 'hoch', ''),
        'lepo': (28374, 'hoch', 'Lepo 2'),
        'zaun': (43530, 'mittel', 'Zaunbriefkasten Emma (Emma 2 hat identische Daten)'),
        'emma2': (43542, 'hoch', ''),
        'moris': (35830, 'hoch', 'Artikelnummer Modell01'),
        'schneider': (43529, 'mittel', '„Schneider" gibt es nicht; Durchwurfbriefkasten Nora'),
        'gienger': (36039, 'mittel', '„Gienger" gibt es nicht; Briefkasten Design Modell-G'),
        'flora': (42093, 'mittel', '„Flora" gibt es nicht; Briefkasten mit Blumenkasten = Siebert Frame J'),
        'stencil2-wand': (42078, 'hoch', ''),
        'lepo1': (42875, 'hoch', ''),
        'bk212-zf': (37027, 'hoch', ''),
        'albrecht': (41964, 'hoch', ''),
        'lepo3': (28375, 'hoch', ''),
        'hermann-funk': (40158, 'hoch', ''),
        'siebert-sf': (42010, 'hoch', ''),
        'anton2': (37809, 'hoch', 'Anton 2'),
        'nora2': (43531, 'hoch', ''),
        'alves3': (44100, 'hoch', ''),
        'alves2': (41648, 'hoch', ''),
        'siebert-stand': (37259, 'hoch', ''),
        'lessing': (41645, 'niedrig', '„Lessing" gibt es nicht; nächster Artikel: Standbriefkasten mit Zeitungsfach Alves'),
        'hugo2': (40684, 'hoch', ''),
        'siebert2': (41951, 'hoch', ''),
        'anton': (34887, 'hoch', ''),
        'hoffmann': (37241, 'hoch', ''),
        'stelio': (37765, 'hoch', ''),
        'enno': (37777, 'hoch', ''),
        'zeppelin': (35011, 'hoch', ''),
        'stencil': (36042, 'hoch', ''),
        'lepo-stahl': (42877, 'hoch', ''),
        'thobe': (37797, 'hoch', ''),
        'gustav': (37782, 'hoch', ''),
        'svena': (37792, 'hoch', ''),
        'oltmann': (36040, 'hoch', ''),
        'neumann': (36038, 'hoch', ''),
        'castor': (36683, 'mittel', '„Castor" gibt es nicht; Kartenbild zeigt Unterputz-Briefkasten Hugo'),
        'hoffmann-sf': (42961, 'hoch', ''),
        'cube-wand': (36041, 'hoch', ''),
        'modell01': (30795, 'hoch', ''),
        'hoffmann-ns': (43524, 'hoch', ''),
        'anton-edelstahl': (34888, 'hoch', ''),
        'anton-anthrazit': (37807, 'hoch', ''),
        'masiva-eiche': (28399, 'hoch', ''),
        'modell02': (43399, 'hoch', ''),
        'masiva-anthrazit': (28397, 'hoch', ''),
        'masiva-laerche': (28404, 'hoch', ''),
        'bk212-ns': (36507, 'hoch', ''),
        'thobe-stand': (38830, 'hoch', ''),
        'modell-g-stand': (37271, 'hoch', ''),
        'ebenhard-stand': (38820, 'hoch', ''),
        'cube-stand': (37312, 'hoch', ''),
        'enno-stand': (38825, 'hoch', ''),
        'stencil-stand': (37266, 'hoch', ''),
        'oltmann-stand': (37284, 'hoch', ''),
        'hoffmann-stand-pe': (41978, 'hoch', ''),
        'stand01': (29221, 'hoch', ''),
        'neumann-stand': (35749, 'hoch', ''),
        'gustav-stand': (31187, 'hoch', ''),
        'hermann-stand': (38810, 'hoch', ''),
        'hoffmann-stand': (26508, 'hoch', ''),
        'cube-stand-sf': (31306, 'hoch', ''),
        'stencil2': (36521, 'hoch', ''),
        'hermann-mfh-edelstahl': (36322, 'hoch', ''),
        'siebert-mfh-edelstahl': (36317, 'hoch', ''),
        'oltmann-mfh': (31309, 'hoch', ''),
        'svena-mfh': (31308, 'hoch', ''),
        'stencil-mfh': (31445, 'hoch', ''),
        'hermann-mfh': (31442, 'hoch', ''),
        'siebert-mfh': (31443, 'hoch', ''),
        'cube': (31307, 'hoch', 'Standbriefkasten Mehrfamilienhaus Cube, 2 Fächer'),
        'hoffmann-edelstahl': (29247, 'mittel', 'Standbriefkasten Mehrfamilienhaus Hoffmann; „gebürstete Edelstahl-Front" steht nicht im Export'),
        'funk02': (26760, 'hoch', ''),
        'lepo2-funk': (29318, 'hoch', ''),
        'siebert-funk': (40154, 'hoch', ''),
        'stencil-funk': (40162, 'hoch', ''),
        'funk01': (34998, 'hoch', ''),
        'funk02-stand': (29212, 'hoch', ''),
    },
}

# Beschreibungswerte, die NICHT ausgespielt werden (widerspruechlich / unplausibel) -> UI zeigt "k. A."
SUPPRESS = {
    (38941, 'viewingAngle'): 'Colson 4–7 Taster: 180° statt 146° wie bei allen übrigen VDM10-2.0-Außenstationen — Herkunft im Beschreibungstext unklar',
    (38947, 'viewingAngle'): 'wie Colson 4 Taster',
    (38953, 'viewingAngle'): 'wie Colson 4 Taster',
    (38959, 'viewingAngle'): 'wie Colson 4 Taster',
}

COLOR_KEY = {'Anthrazit': 'anthrazit', 'Schwarz': 'schwarz', 'Grau': 'grau', 'Eisenglimmer': 'eisenglimmer',
             'Weiß': 'weiss', 'Edelstahl': 'edelstahl', 'Braun': 'braun', 'Wunschfarbe': 'wunschfarbe'}
COLOR_ORDER = list(COLOR_KEY.values())
TB_ORDER = ['RFID', 'PIN-Code', 'QR-Code', 'Fingerprint', 'Gesichtserkennung']
MAT_NORM = {'V2A Edelstahl (1.4301)': 'Edelstahl V2A (1.4301)', 'V4A Edelstahl': 'Edelstahl V4A'}
MAT_ORDER = ['Galvanisierter Stahl', 'Edelstahl', 'Edelstahl V2A (1.4301)', 'Edelstahl V4A', 'Acrylglas', 'Lärchenholz', 'Metall']

SPR_MAIN = ('Video Sprechanlagen', 'Audio Sprechanlagen', 'Sprechanlagen Sets')
SPR_NOT = ('Erweiterungen & Zubehör', 'Ersatz Namensschilder', 'Innenstationen')
BK_MAIN = ('Einfamilien Briefkasten', 'Standbriefkästen', 'Mehrfamilien Briefkästen', 'Briefkasten ohne Gravur',
           'Unterputz Briefkästen', 'Briefkasten mit Klingel & Sprechanlage')
BK_NOT = ('Ersatzteile & Zubehör', 'Briefkastenschilder', 'Briefkastenständer', 'Briefkastenanlagen Konfigurator')


def de(n):
    """Zahl im deutschen Format, ohne unnoetige Nachkommastellen."""
    s = ('%.2f' % n).rstrip('0').rstrip('.')
    return s.replace('.', ',')


def subs(p):
    return [s.split(' > ', 1)[-1] for s in p.get('subcategories', [])]


def is_main(cat, p):
    ss = ' | '.join(p.get('subcategories', []))
    if cat == 'sprechanlage':
        return any(k in ss for k in SPR_MAIN)      # Zubehoer, Innenstationen, Ersatzschilder liegen nur in SPR_NOT-Kategorien
    if any(k in ss for k in BK_NOT):
        return False
    if p['name'].startswith('Metzler Videosprechanlage'):     # Sprechanlagen-Einzelteil im Briefkasten-Baum
        return False
    return any(k in ss for k in BK_MAIN) or 'Anzahl der Briefkastenfächer' in p['merkmale']


def klingel(vals):
    if not vals:
        return None
    if any('Flexibel' in v for v in vals):
        return 'Flexibel (1–500)'
    nums = sorted(int(v.split()[0]) for v in vals if v.split()[0].isdigit())
    if len(nums) == 1:
        return str(nums[0])
    return '%d–%d' % (nums[0], nums[-1]) if nums else ', '.join(vals)


def namensschild(vals):
    if not vals:
        return None
    m = {'mit Papiereinleger': 'Austauschbar (Papiereinleger)'}
    return ' · '.join(m.get(v, v) for v in vals)


def colors(merk_lists):
    s = set()
    for lst in merk_lists:
        for v in lst or []:
            if v in COLOR_KEY:
                s.add(COLOR_KEY[v])
    return [c for c in COLOR_ORDER if c in s] or None


def materials(vals):
    if not vals:
        return None
    s = {MAT_NORM.get(v, v) for v in vals}
    return [m for m in MAT_ORDER if m in s] + sorted(x for x in s if x not in MAT_ORDER)


def dims_txt(dm):
    b, h, t = dm.get('breiteCm'), dm.get('hoeheCm'), dm.get('tiefeCm')
    if b is None and h is None and t is None:
        return None
    return ' × '.join(de(x) if x is not None else 'k. A.' for x in (b, h, t)) + ' cm'


def weight(objs):
    ws = sorted({o['weight']['articleKg'] for o in objs if o['weight'].get('articleKg') is not None})
    if not ws:
        return None, False
    if len(ws) == 1:
        return de(ws[0]) + ' kg', False
    return de(ws[0]) + '–' + de(ws[-1]) + ' kg', True


def typ_of(p):
    ss = ' '.join(subs(p))
    if 'Audio Sprechanlagen' in ss or 'Audio-' in p['name']:
        return 'Audio'
    if 'Video' in ss or 'Video' in p['name'] or 'Kamera' in p['name']:
        return 'Video'
    return None


def spec(p, key):
    if (p['id'], key) in SUPPRESS:
        return None
    return (p.get('specsFromDescription') or {}).get(key)


def cam_txt(v):
    if not v:
        return None
    if 'Full HD' in v:                         # "Full HD" und "2 MP / Full HD" meinen dasselbe (1920 × 1080 ≈ 2 MP)
        return '2 MP (Full HD)'
    return v


def angle_txt(v):
    if not v:
        return None
    nums = sorted((int(x.rstrip('°')) for x in v), reverse=True)
    return ' / '.join('%d°' % n for n in nums)


def build_entry(cat, pid, m, idx):
    sid, conf, note = m[0], m[1], m[2]
    variant = m[3] if len(m) > 3 else None
    e = {'conf': conf}
    if note:
        e['note'] = note
    if sid is None:
        return e
    p = idx[sid]
    objs = [p] + p['variants']
    if variant:
        v = next(x for x in p['variants'] if x['artNr'] == variant)
        objs = [v]
        merk = dict(p['merkmale'])
        merk.update(v['merkmale'])
        merk['Farbe'] = v['merkmale'].get('Farbe', [])
        if 'Namensschild' not in v['merkmale']:
            merk.pop('Namensschild', None)      # Variante hat ein anderes Schild als der Vaterartikel -> nicht uebernehmen
        e.update(sid=v['id'], art=v['artNr'], url=v['url'], shop=v['name'], parent=p['artNr'])
        dims = v['dimensions']
        col = colors([v['merkmale'].get('Farbe')])
    else:
        merk = p['merkmale']
        e.update(sid=p['id'], art=p['artNr'], url=p['url'], shop=p['name'])
        dims = p['dimensions']
        col = colors([p['merkmale'].get('Farbe')] + [x['merkmale'].get('Farbe') for x in p['variants']])
        vd = {json.dumps(x['dimensions'], sort_keys=True) for x in p['variants']}
        if len(vd) > 1 or (vd and json.dumps(dims, sort_keys=True) not in vd):
            e['abmv'] = True                    # Masse weichen je Variante ab
    e['col'] = col
    e['abm'] = dims_txt(dims)
    e['kg'], kgv = weight(objs)
    if kgv:
        e['kgv'] = True
    g = lambda k: merk.get(k) or None
    if cat == 'sprechanlage':
        e['typ'] = typ_of(p)
        sysv = g('System')
        e['sys'] = {'IP-System': 'IP-System', 'BUS-System': '2-Draht-BUS'}.get(sysv[0], sysv[0]) if sysv else None
        e['kt'] = klingel(g('Anzahl der Klingeltaster'))
        e['ns'] = namensschild(g('Namensschild'))
        tb = g('Türöffner Bedienung')
        e['tb'] = [t for t in TB_ORDER if t in tb] + [t for t in tb if t not in TB_ORDER] if tb else None
        video = e['typ'] == 'Video'
        e['cam'] = cam_txt(spec(p, 'cameraResolution')) if video else None
        e['va'] = angle_txt(spec(p, 'viewingAngle')) if video else None
        e['nv'] = True if (video and spec(p, 'nightVision')) else None
        ip, ik = spec(p, 'ipRating'), spec(p, 'ikRating')
        e['ip'] = ' / '.join(ip) if ip else None
        e['ik'] = ' / '.join(ik) if ik else None
        parts = []
        if g('Paketbox'):
            parts.append('Paketbox')
        if g('Briefkastentyp'):
            parts.append(g('Briefkastentyp')[0])
        if g('Anzahl der Briefkastenfächer'):
            n = g('Anzahl der Briefkastenfächer')[0]
            parts.append(n + (' Fach' if n == '1' else ' Fächer'))
        combo_cat = any('mit Briefkasten/Paketbox' in s for s in subs(p))
        e['kombi'] = ' · '.join(parts) if parts else ('Ja' if combo_cat else 'Nein')
    else:
        e['fa'] = g('Anzahl der Briefkastenfächer')[0] if g('Anzahl der Briefkastenfächer') else None
        e['zf'] = g('Zeitungsfach')[0] if g('Zeitungsfach') else None
        e['mo'] = g('Montageart')
        e['ns'] = namensschild(g('Namensschild'))
        e['mat'] = materials(g('Material'))
        sysv = g('System')
        kt = klingel(g('Anzahl der Klingeltaster'))
        if sysv:
            e['klingel'] = ('Video-Türsprechanlage' if ('Video' in p['name'] or p.get('specsFromDescription', {}).get('cameraResolution')) else 'Sprechanlage') + \
                ' (' + {'IP-System': 'IP-System', 'BUS-System': '2-Draht-BUS'}.get(sysv[0], sysv[0]) + ')'
        elif kt:
            e['klingel'] = ('Funkklingel' if 'Funk' in p['name'] else 'Klingel') + ' (' + kt + (' Taster)' if kt != '1' else ' Taster)')
        else:
            e['klingel'] = 'Nein'
        e['set'] = e['klingel'] != 'Nein'
    e['card'] = card_fields(cat, e, g, e['shop'])
    e['card']['f'] = facet_values(merk, [] if variant else p['variants'])
    return e


# Filter der PLPs 1:1 wie im Shop: Rohwerte der Merkmale, nach denen die Live-Kategorie filtert
# (Vaterartikel + alle Varianten). Schluessel = Gruppen-Code in plp.js / sprechanlage.js.
FACET_MERKMALE = (('fa', 'Anzahl der Briefkastenfächer'), ('kt', 'Anzahl der Klingeltaster'), ('mo', 'Montageart'),
                  ('tb', 'Türöffner Bedienung'), ('zf', 'Zeitungsfach'), ('ns', 'Namensschild'), ('pb', 'Paketbox'),
                  ('sys', 'System'), ('bt', 'Briefkastentyp'), ('mk', 'Marke'))


def facet_values(merk, variants):
    f = {}
    for code, name in FACET_MERKMALE:
        vals = uniq(list(merk.get(name) or []) + [x for v in variants for x in (v['merkmale'].get(name) or [])])
        if vals:
            f[code] = vals
    return f


# Produktkarten + Filter der PLPs: dieselben Shop-Werte, in die Filter-Schluessel der Prototyp-Karten
# uebersetzt (plp.js / sprechanlage.js wenden `card` beim Laden an). null/[] = im Shop nicht gepflegt.
MO_KEY = {'Aufputz': 'wand', 'Standmontage': 'stand', 'Unterputz': 'unterputz', 'Zaunmontage': 'zaun'}
BK_MAT_KEY = {'Galvanisierter Stahl': 'stahl', 'Edelstahl': 'edelstahl', 'Edelstahl V2A (1.4301)': 'edelstahl',
              'Edelstahl V4A': 'edelstahl', 'Acrylglas': 'acrylglas', 'Lärchenholz': 'holz'}
SP_MAT_KEY = {'Galvanisierter Stahl': 'galvanisiert', 'Edelstahl': 'edelstahl', 'V2A Edelstahl (1.4301)': 'v2a'}
TB_KEY = {'RFID': 'rfid', 'PIN-Code': 'pin', 'QR-Code': 'qr', 'Fingerprint': 'fingerprint', 'Gesichtserkennung': 'gesicht'}
NS_KEY = {'Lasergraviert': 'gravur', 'mit Papiereinleger': 'wechsel', 'Digital': 'display'}


def uniq(xs):
    out = []
    for x in xs:
        if x and x not in out:
            out.append(x)
    return out


def card_fields(cat, e, g, shop_name):
    c = {'name': ' '.join(shop_name.replace('Metzler ', '', 1).replace(' und ', ' & ').split()), 'colors': e['col'] or []}
    if cat == 'sprechanlage':
        c['system'] = {'IP-System': 'ip', '2-Draht-BUS': 'bus'}.get(e['sys'])
        kt = e['kt']
        c['klingel'] = 'flex' if kt and kt.startswith('Flexibel') else kt
        c['tuer'] = [TB_KEY[t] for t in (e['tb'] or []) if t in TB_KEY]
        c['type'] = (e['typ'] or '').lower() or None
        c['briefkasten'] = e['kombi'] != 'Nein'
        c['material'] = (uniq(SP_MAT_KEY.get(v) for v in (g('Material') or [])) or [None])[0]
        c['ns'] = (uniq(NS_KEY.get(v) for v in (g('Namensschild') or [])) or [None])[0]
        return c
    c['faecher'] = e['fa']
    c['zeitung'] = (e['zf'] or '').lower() or None
    c['montages'] = uniq(MO_KEY.get(v) for v in (e['mo'] or []))
    mats = uniq(BK_MAT_KEY.get(v) for v in (e['mat'] or []))
    if not mats:                                  # Merkmal fehlt: nur was der Shop-Artikelname selbst sagt
        n = re.sub(r'edelstahl[- ]namensschild', '', shop_name.lower())   # Schild-Material ist nicht das Gehaeuse
        mats = uniq(k for w, k in (('edelstahl', 'edelstahl'), ('acrylglas', 'acrylglas'), ('holz', 'holz')) if w in n)
    c['materials'] = mats
    kl = e['klingel']
    c['sprech'] = 'sprechanlage' in kl.lower()
    c['klingel'] = kl != 'Nein'                   # jede Sprechanlage hat einen Klingeltaster
    c['paket'] = 'paket' in shop_name.lower()
    c['blumenkasten'] = 'blumenkasten' in shop_name.lower()
    return c


def load(src):
    with open(src, encoding='utf-8') as f:
        return json.load(f)


def build(data):
    cats = {'sprechanlage': data['categories'][1], 'briefkasten': data['categories'][0]}
    out = {'stand': data.get('generated'), 'quelle': 'Metzler Shop (JTL-Wawi)'}
    for cat, c in cats.items():
        idx = {p['id']: p for p in c['products']}
        out[cat] = {pid: build_entry(cat, pid, m, idx) for pid, m in MAP[cat].items()}
    if os.path.exists(DEF_IMG):
        with open(DEF_IMG, encoding='utf-8') as f:
            imgs = json.load(f)
        for cat in ('sprechanlage', 'briefkasten'):
            for pid, path in imgs.get(cat, {}).items():
                if out[cat].get(pid, {}).get('sid'):
                    out[cat][pid]['img'] = IMG_BASE + path
    return out, cats


def write_js(out, path):
    stand = out['stand'] or ''
    js = ('/* Vergleichsdaten Version B — GENERIERT von tools/build_vergleich_daten.py aus dem Shop-Export ' + stand + '.\n'
          '   Nicht von Hand bearbeiten: Skript neu ausführen. null = im Shop nicht gepflegt (UI: „k. A.").\n'
          '   Felder: sid/art/url/shop = Shop-Artikel · conf = Sicherheit der Zuordnung · col = Farben (alle Varianten) ·\n'
          '   abm = B × H × T · kg = Artikelgewicht (Spanne, wenn Varianten abweichen → kgv) · Sprechanlagen: typ, sys, kt (Klingeltaster),\n'
          '   ns (Namensschild), tb (Türöffner-Bedienung), cam/va/nv/ip/ik (laut Produktbeschreibung), kombi ·\n'
          '   Briefkästen: fa (Fächer), zf (Zeitungsfach), mo (Montageart), mat (Material), klingel, set ·\n'
          '   card = dieselben Werte als Filter-Schlüssel der Produktkarten (plp.js / sprechanlage.js); card.f = Merkmal-Rohwerte\n'
          '   der Live-Filter (fa Fächer, kt Klingeltaster, mo Montageart, tb Türöffner, zf Zeitungsfach, ns Namensschild, pb Paketbox,\n'
          '   sys System, bt Briefkastentyp, mk Marke) ·\n'
          '   img = Hauptbild der Shop-Produktseite (tools/shop-bilder.json), genutzt im Vergleich */\n'
          'window.MTZ_VGL_DATA=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(js)
    return len(js.encode('utf-8'))


# ---------------------------------------------------------------------------
# 2) Bericht: Abdeckung je Merkmal (nur Hauptartikel) + Datenluecken-Listen
# ---------------------------------------------------------------------------
def short(p):
    return p['name'].replace('Metzler ', '')[:90]


def report(cats, path):
    L = []
    for cat, c in cats.items():
        mains = [p for p in c['products'] if is_main(cat, p)]
        n = len(mains)
        L.append('## %s — %d Hauptartikel (von %d Artikeln im Export)\n' % (c['name'], n, len(c['products'])))
        cnt = collections.Counter()
        for p in mains:
            for k in p['merkmale']:
                cnt[k] += 1
        L.append('| Merkmal / Feld | Hauptartikel mit Wert | Abdeckung |')
        L.append('|---|---:|---:|')
        for k, v in cnt.most_common():
            L.append('| %s | %d | %d %% |' % (k, v, round(100 * v / n)))
        full = sum(1 for p in mains if all(p['dimensions'].get(x) is not None for x in ('breiteCm', 'hoeheCm', 'tiefeCm')))
        anyd = sum(1 for p in mains if any(p['dimensions'].get(x) is not None for x in ('breiteCm', 'hoeheCm', 'tiefeCm')))
        kg = sum(1 for p in mains if p['weight'].get('articleKg') is not None)
        L.append('| Abmessungen vollständig (B, H, T) | %d | %d %% |' % (full, round(100 * full / n)))
        L.append('| Abmessungen teilweise | %d | %d %% |' % (anyd - full, round(100 * (anyd - full) / n)))
        L.append('| Artikelgewicht (Vaterartikel) | %d | %d %% |' % (kg, round(100 * kg / n)))
        sc = collections.Counter()
        vid = [p for p in mains if cat == 'sprechanlage' and typ_of(p) == 'Video']
        for p in mains:
            for k in (p.get('specsFromDescription') or {}):
                sc[k] += 1
        for k, v in sc.most_common():
            base = len(vid) if (cat == 'sprechanlage' and k in ('cameraResolution', 'viewingAngle', 'nightVision')) else n
            L.append('| Beschreibung: %s%s | %d | %d %% |' % (k, ' (nur Video, n=%d)' % base if base != n else '', v, round(100 * v / base)))
        L.append('')
        # Datenluecken je Merkmal (Listen)
        need = ['Farbe', 'Namensschild', 'Material', 'Montageart'] if cat == 'briefkasten' else ['Farbe', 'Namensschild', 'Türöffner Bedienung', 'Montageart', 'System', 'Anzahl der Klingeltaster']
        if cat == 'briefkasten':
            need += ['Anzahl der Briefkastenfächer', 'Zeitungsfach']
        for k in need:
            miss = [p for p in mains if k not in p['merkmale']]
            if miss:
                L.append('**%s fehlt (%d):** %s\n' % (k, len(miss), '; '.join('%s (%s)' % (short(p), p['artNr']) for p in miss)))
        miss = [p for p in mains if p['dimensions'].get('tiefeCm') is None]
        L.append('**Tiefe fehlt (%d):** %s\n' % (len(miss), '; '.join('%s (%s)' % (short(p), p['artNr']) for p in miss)))
        miss = [p for p in mains if p['weight'].get('articleKg') is None]
        L.append('**Artikelgewicht fehlt (%d):** %s\n' % (len(miss), '; '.join('%s (%s)' % (short(p), p['artNr']) for p in miss)))
        if cat == 'sprechanlage':
            for k in ('cameraResolution', 'viewingAngle', 'nightVision', 'ipRating'):
                miss = [p for p in (vid if k != 'ipRating' else mains) if k not in (p.get('specsFromDescription') or {})]
                L.append('**Beschreibung ohne %s (%d):** %s\n' % (k, len(miss), '; '.join('%s (%s)' % (short(p), p['artNr']) for p in miss)))
        # Auffaellige Werte
        odd = []
        for p in mains:
            w = p['weight']
            if w.get('articleKg') and w.get('shippingKg') and w['shippingKg'] < w['articleKg']:
                odd.append('%s (%s): Versandgewicht %s kg < Artikelgewicht %s kg' % (short(p), p['artNr'], de(w['shippingKg']), de(w['articleKg'])))
            ws = sorted({v['weight']['articleKg'] for v in p['variants'] if v['weight'].get('articleKg') is not None} | ({w['articleKg']} if w.get('articleKg') else set()))
            if cat == 'briefkasten' and w.get('articleKg') is not None and w['articleKg'] < 1.5:
                odd.append('%s (%s): Artikelgewicht %s kg für einen Briefkasten unplausibel' % (short(p), p['artNr'], de(w['articleKg'])))
            if len(ws) > 1 and ws[-1] / ws[0] > 1.25:
                odd.append('%s (%s): Artikelgewicht je Variante %s kg' % (short(p), p['artNr'], ' / '.join(de(x) for x in ws)))
            d = p['dimensions']
            if d.get('breiteCm') and d.get('tiefeCm') and d['tiefeCm'] > 3 * d['breiteCm']:
                odd.append('%s (%s): Tiefe %s cm > 3 × Breite %s cm (Achsen vertauscht?)' % (short(p), p['artNr'], de(d['tiefeCm']), de(d['breiteCm'])))
        if odd:
            L.append('**Auffällige Werte (%d):**\n' % len(odd))
            L.extend('- ' + o for o in odd)
            L.append('')
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(L) + '\n')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default=DEF_SRC)
    ap.add_argument('--out', default=DEF_OUT)
    ap.add_argument('--report', default=None)
    a = ap.parse_args()
    data = load(a.src)
    out, cats = build(data)
    size = write_js(out, a.out)
    n = {k: sum(1 for e in out[k].values() if e.get('sid')) for k in ('sprechanlage', 'briefkasten')}
    print('vergleich-daten.js: %d Bytes · zugeordnet Sprechanlagen %d/%d · Briefkästen %d/%d' % (
        size, n['sprechanlage'], len(MAP['sprechanlage']), n['briefkasten'], len(MAP['briefkasten'])))
    if a.report:
        report(cats, a.report)
        print('Bericht: ' + a.report)


if __name__ == '__main__':
    sys.exit(main())
