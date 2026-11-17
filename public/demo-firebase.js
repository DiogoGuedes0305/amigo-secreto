// Modo demo: imita a parte do Firestore (SDK compat) que a app usa, com os dados guardados no localStorage.
// Só entra em ação quando não há FIREBASE_CONFIG. Os nomes e números são fictícios.
// Vários separadores do mesmo browser ficam sincronizados (evento "storage"), como vários telemóveis.
(function () {
  if (window.FIREBASE_CONFIG) return;
  const KEY = "as_demo_db";
  const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
  const agora = Date.now();
  const ANO = new Date().getMonth() === 11 || new Date().getMonth() >= 9 ? new Date().getFullYear() : new Date().getFullYear() - 1;

  function semente() {
    const d = {};
    const pessoas = [
      ["p910000001", "Ana", "Ribeiro", "Casa da Ana"],
      ["p910000002", "Bruno", "Ribeiro", "Casa da Ana"],
      ["p910000003", "Henrique", "Ribeiro", "Casa da Ana"],
      ["p910000004", "Carla", "Sousa", "Casa dos Avós"],
      ["p910000005", "Daniel", "Sousa", "Casa dos Avós"],
      ["p910000006", "Gabriela", "Sousa", "Casa dos Avós"],
      ["p910000007", "Eva", "Lopes", "Casa da Eva"],
      ["p910000008", "Frederico", "Lopes", "Casa da Eva"],
    ];
    pessoas.forEach(([id, nome, apelido, casa], i) => {
      d["pessoas/" + id] = { nome, apelido, telefone: id.slice(1), casa, criadoEm: agora - (8 - i) * 86400000, chaves: [] };
    });
    d["config/geral"] = {
      ano: ANO, fase: "registo", adminId: "p910000001",
      casas: ["Casa da Ana", "Casa dos Avós", "Casa da Eva"],
      regras: { casa: true, anoPassado: true },
      valor: "até 25 €", data: "Jantar de 24, em casa dos avós", dataDia: ANO + "-12-24",
    };
    // O ano passado (para a regra "não repetir"): quem deu a quem.
    d["anos/" + (ANO - 1)] = { origem: "sorteio", em: agora - 330 * 86400000, pares: {
      p910000001: "p910000004", p910000004: "p910000007", p910000007: "p910000002", p910000002: "p910000005",
      p910000005: "p910000008", p910000008: "p910000003", p910000003: "p910000006", p910000006: "p910000001" } };
    d["recordacoes/" + (ANO - 2)] = { album: "", nota: "O ano em que o Daniel trouxe o bolo-rei ao contrário.", em: agora,
      pares: [{ de: "Ana", para: "Daniel" }, { de: "Daniel", para: "Eva" }, { de: "Eva", para: "Henrique" }, { de: "Henrique", para: "Ana" }] };
    d["recordacoes/" + (ANO - 1)] = { album: "", nota: "Primeiro Natal com a app. Sorteio com chapéu e confetis.", em: agora };
    const desejos = {
      p910000002: [["Livro de receitas de bacalhau", "", "Qualquer um serve"], ["Meias de lã", "", "Tamanho 43"]],
      p910000004: [["Vaso para a varanda", "", "Grande, de barro"]],
      p910000007: [["Jogo de tabuleiro", "", "Para jogar em família"], ["Caneca", "", ""]],
      p910000008: [["Auscultadores", "", "Sem fios"]],
    };
    Object.entries(desejos).forEach(([id, itens]) => itens.forEach(([titulo, link, obs], i) => {
      d[`desejos/${id}/itens/d${i}`] = { titulo, link, obs, em: agora - (10 - i) * 3600000, ano: ANO };
    }));
    return d;
  }

  function ler() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  let dados = ler();
  if (!dados) { dados = semente(); guardar(); }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(dados)); } catch (e) {} }

  const ouvintes = new Set();
  function avisar() { ouvintes.forEach(f => f()); }
  function mudou() { guardar(); setTimeout(avisar, 0); }
  window.addEventListener("storage", e => { if (e.key === KEY) { dados = ler() || semente(); avisar(); } });

  // ---- FieldValue ----
  const OP = "__demoOp";
  const FieldValue = {
    delete: () => ({ [OP]: "del" }),
    increment: n => ({ [OP]: "inc", n }),
    arrayUnion: (...v) => ({ [OP]: "union", v }),
  };
  function valorFinal(atual, v) {
    if (v && typeof v === "object" && v[OP]) {
      if (v[OP] === "inc") return (typeof atual === "number" ? atual : 0) + v.n;
      if (v[OP] === "union") { const a = Array.isArray(atual) ? atual.slice() : []; v.v.forEach(x => { if (!a.includes(x)) a.push(x); }); return a; }
    }
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const o = {};
      for (const [k, x] of Object.entries(v)) { if (!(x && x[OP] === "del")) o[k] = valorFinal(undefined, x); }
      return o;
    }
    return clone(v);
  }
  function fundir(alvo, v) { // set com merge: junta mapas em profundidade
    for (const [k, x] of Object.entries(v)) {
      if (x && x[OP] === "del") delete alvo[k];
      else if (x && typeof x === "object" && !Array.isArray(x) && !x[OP]) {
        if (!alvo[k] || typeof alvo[k] !== "object" || Array.isArray(alvo[k])) alvo[k] = {};
        fundir(alvo[k], x);
      } else alvo[k] = valorFinal(alvo[k], x);
    }
  }
  function porCaminho(alvo, chave, x) { // update com "a.b"
    const p = chave.split(".");
    let o = alvo;
    for (let i = 0; i < p.length - 1; i++) { if (!o[p[i]] || typeof o[p[i]] !== "object") o[p[i]] = {}; o = o[p[i]]; }
    const k = p[p.length - 1];
    if (x && x[OP] === "del") delete o[k]; else o[k] = valorFinal(o[k], x);
  }

  // ---- snapshots ----
  const idDe = caminho => caminho.split("/").pop();
  const docSnap = caminho => {
    const v = dados[caminho];
    return { id: idDe(caminho), exists: v !== undefined, data: () => clone(v) };
  };
  function querySnap(col, ordem, limite) {
    const pref = col + "/";
    let docs = Object.keys(dados).filter(k => k.startsWith(pref) && !k.slice(pref.length).includes("/")).map(docSnap);
    if (ordem) {
      const [campo, dir] = ordem;
      docs.sort((a, b) => { const x = a.data()[campo], y = b.data()[campo]; return (x > y ? 1 : x < y ? -1 : 0) * (dir === "desc" ? -1 : 1); });
    }
    if (limite) docs = docs.slice(0, limite);
    return { docs, size: docs.length, empty: !docs.length, forEach: f => docs.forEach(f) };
  }
  function ouvir(foto, cb) {
    let ultimo = null;
    const f = () => {
      const s = foto();
      const assinatura = JSON.stringify(s.docs ? s.docs.map(d => [d.id, d.data()]) : [s.exists, s.data()]);
      if (assinatura === ultimo) return;
      ultimo = assinatura; cb(s);
    };
    ouvintes.add(f); setTimeout(f, 0);
    return () => ouvintes.delete(f);
  }

  // ---- referências ----
  function doc(caminho) {
    const ref = {
      id: idDe(caminho), path: caminho,
      get: async () => docSnap(caminho),
      set: async (v, opt) => {
        if (opt && opt.merge) { const o = clone(dados[caminho]) || {}; fundir(o, v); dados[caminho] = o; }
        else dados[caminho] = valorFinal(undefined, v);
        mudou();
      },
      update: async v => {
        if (dados[caminho] === undefined) throw new Error("not-found");
        const o = clone(dados[caminho]);
        for (const [k, x] of Object.entries(v)) porCaminho(o, k, x);
        dados[caminho] = o; mudou();
      },
      delete: async () => {
        // apaga o documento e o que está por baixo dele (a demo não deixa "subcoleções órfãs")
        delete dados[caminho]; mudou();
      },
      onSnapshot: (cb) => ouvir(() => docSnap(caminho), cb),
      collection: sub => collection(caminho + "/" + sub),
    };
    return ref;
  }
  function collection(caminho, ordem, limite) {
    return {
      path: caminho,
      doc: id => doc(caminho + "/" + (id || Math.random().toString(36).slice(2, 12))),
      orderBy: (campo, dir) => collection(caminho, [campo, dir], limite),
      limit: n => collection(caminho, ordem, n),
      get: async () => querySnap(caminho, ordem, limite),
      add: async v => { const r = doc(caminho + "/" + Math.random().toString(36).slice(2, 12)); await r.set(v); return r; },
      onSnapshot: (cb) => ouvir(() => querySnap(caminho, ordem, limite), cb),
    };
  }
  const db = {
    doc, collection: c => collection(c),
    useEmulator() {},
    batch() {
      const ops = [];
      return {
        set(r, v, o) { ops.push(() => r.set(v, o)); return this; },
        update(r, v) { ops.push(() => r.update(v)); return this; },
        delete(r) { ops.push(() => r.delete()); return this; },
        async commit() { for (const f of ops) await f(); },
      };
    },
  };
  const firestore = () => db;
  firestore.FieldValue = FieldValue;
  window.firebase = { initializeApp() {}, firestore };

  // ---- faixa da demo ----
  window.repoDemo = () => {
    ["as_demo_db", "as_me", "as_pedido", "as_visto", "as_chave"].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    location.reload();
  };
  window.trocarDemo = () => {
    ["as_me", "as_pedido"].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    location.reload();
  };
  document.addEventListener("DOMContentLoaded", () => document.body.insertAdjacentHTML("afterbegin",
    `<div style="position:sticky;top:0;z-index:9;background:#1f6b45;color:#fff;text-align:center;padding:7px 10px;font-size:.85rem;line-height:1.35">
      🎭 <b>Demo</b> — família fictícia, dados guardados só neste browser.<br>
      Entra como a organizadora: <b>Ana Ribeiro · 910 000 001</b>
      — ou outra pessoa: 910 000 002 a 910 000 008.
      <button onclick="trocarDemo()" style="margin-left:6px;background:transparent;color:#fff;border:1px solid #fff;border-radius:99px;padding:2px 10px;cursor:pointer">👤 Trocar de pessoa</button>
      <button onclick="repoDemo()" style="margin-left:6px;background:#fff;color:#1f6b45;border:0;border-radius:99px;padding:2px 10px;font-weight:700;cursor:pointer">↺ Repor</button>
    </div>`));
})();
