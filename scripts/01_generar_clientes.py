#!/usr/bin/env python3
"""Genera data/clientes.json a partir de nvidia/Nemotron-Personas-El-Salvador.

Uso:
  pip install datasets pandas pyarrow
  python scripts/01_generar_clientes.py                      # descarga de Hugging Face
  python scripts/01_generar_clientes.py --input personas.parquet
  python scripts/01_generar_clientes.py --por-municipio 25   # máximo de clientes por municipio

Columnas del dataset que se usan: uuid, age, sex, occupation, municipality,
department, area, culinary_persona.  El 'pedido' sale de palabras clave de
culinary_persona; si no hay ninguna, se reparte entre los 5 rellenos con un
hash estable del uuid (así el resultado es reproducible).
"""
import argparse, hashlib, json, os, re, unicodedata

RELLENOS = ["frijol con queso", "queso", "ayote", "chicharrón", "queso con loroco"]
# Orden importa: lo más específico primero.
CLAVES = [
    ("queso con loroco", r"loroco"),
    ("frijol con queso", r"frijol"),
    ("chicharrón", r"chicharr"),
    ("ayote", r"ayote"),
    ("queso", r"queso"),
]

def sin_acentos(t):
    return "".join(c for c in unicodedata.normalize("NFD", t) if unicodedata.category(c) != "Mn")

def pedido(culinary, uuid):
    t = sin_acentos(str(culinary or "").lower())
    for nombre, patron in CLAVES:
        if re.search(sin_acentos(patron), t):
            return nombre, "texto"
    h = int(hashlib.md5(str(uuid).encode()).hexdigest(), 16)
    return RELLENOS[h % len(RELLENOS)], "hash"

def construir(df, por_municipio=25, semilla=7):
    import pandas as pd
    df = df.dropna(subset=["age", "sex", "occupation", "municipality"]).copy()
    df["age"] = df["age"].astype(int)
    partes = [g.sample(min(len(g), por_municipio), random_state=semilla)
              for _, g in df.groupby("municipality")]
    df = pd.concat(partes).sort_values(["municipality", "uuid"])
    filas, origen = [], {"texto": 0, "hash": 0}
    for r in df.itertuples():
        p, o = pedido(getattr(r, "culinary_persona", ""), r.uuid)
        origen[o] += 1
        filas.append({
            "uuid": str(r.uuid), "age": int(r.age), "sex": str(r.sex),
            "occupation": str(r.occupation).strip(), "municipality": str(r.municipality),
            "department": str(getattr(r, "department", "")), "area": str(getattr(r, "area", "")),
            "education_level": str(getattr(r, "education_level", "")),
            "persona": str(getattr(r, "persona", ""))[:240],
            "travel_persona": str(getattr(r, "travel_persona", ""))[:200],
            "hobbies_and_interests": str(getattr(r, "hobbies_and_interests", ""))[:200],
            "professional_persona": str(getattr(r, "professional_persona", ""))[:200],
            "department_name": str(getattr(r, "department", "")),
            "pedido": p})
    return filas, origen

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input")
    ap.add_argument("--por-municipio", type=int, default=25)
    ap.add_argument("--salida", default=os.path.join(os.path.dirname(__file__), "..", "data", "clientes.json"))
    a = ap.parse_args()
    import pandas as pd
    if a.input:
        df = pd.read_parquet(a.input)
    else:
        from datasets import load_dataset
        df = load_dataset("nvidia/Nemotron-Personas-El-Salvador", split="train").to_pandas()
    filas, origen = construir(df, a.por_municipio)
    with open(a.salida, "w", encoding="utf-8") as f:
        json.dump(filas, f, ensure_ascii=False, indent=1)
    # Copia como script para que index.html funcione con doble clic (sin servidor).
    js = os.path.join(os.path.dirname(os.path.abspath(a.salida)), "clientes_data.js")
    with open(js, "w", encoding="utf-8") as f:
        f.write("window.CLIENTES_DATA = " + json.dumps(filas, ensure_ascii=False) + ";\n")
    print(f"{len(filas)} clientes en {len({x['municipality'] for x in filas})} municipios -> {os.path.abspath(a.salida)}")
    print("pedido por texto:", origen["texto"], "| por hash:", origen["hash"])

if __name__ == "__main__":
    main()
