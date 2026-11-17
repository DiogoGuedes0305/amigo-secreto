# 🎅 Amigo Secreto — Natal em família

Uma web app para o amigo secreto de Natal da família: cada um entra no telemóvel, faz a lista de desejos,
e o organizador faz o sorteio na app. Sem contas e sem palavras-passe, num só ficheiro HTML.

▶ **Experimentar a demo:** https://diogoguedes0305.github.io/amigo-secreto/

<p align="center"><img src="docs/demo.gif" alt="Demo animada: entrar, lista de desejos, sorteio animado, o amigo secreto e recordações" width="720"></p>
<p align="center"><sub>🎬 Demo animada · do registo ao sorteio</sub></p>

> A demo usa uma **família fictícia** (Ana, Bruno, Carla…) e guarda tudo **só no teu browser**.
> Entra como a organizadora com **Ana Ribeiro · 910 000 001**, ou como outra pessoa com 910 000 002 a 910 000 008.
> "👤 Trocar de pessoa" muda de pessoa e "↺ Repor" volta ao início.

## O que tem

- **Entrar sem conta**: primeiro nome, último nome e telemóvel. O telemóvel fica a ser a chave da pessoa;
  se o mesmo número entrar noutro aparelho, o organizador tem de aceitar o pedido.
- **🎲 Sorteio animado** (chapéu, papelinhos, 3-2-1, confetis e sons). Todos os telemóveis veem a animação ao mesmo tempo.
  Regras opcionais: ninguém tira alguém da **mesma casa** nem o **mesmo do ano passado**.
- **👀 O teu amigo secreto**, escondido até tocares em "Ver".
- **📝 Lista de desejos** (com links e notas). A do teu amigo secreto aparece por baixo do cartão dele.
- **⏳ Contagem decrescente** para o dia da troca, valor da prenda e local.
- **📸 Recordações**: um cartão por ano com o álbum de fotos e "quem deu a quem".
- **⚙️ Admin** (só o organizador): fases do Natal, casas, quem entrou na app, quem ainda não fez a lista
  e um lembrete pronto para mandar no WhatsApp.

## Como funciona

- `public/index.html` — a app inteira (HTML, CSS e JavaScript, Firebase SDK compat).
- `public/config.js` — a configuração do Firebase. Com `null`, a app corre em **modo demo**.
- `public/demo-firebase.js` — imita o Firestore no `localStorage`, com os dados fictícios (só para a demo).
- `firestore.rules` — regras abertas às coleções da app (pensado para uma família, sem autenticação).

### Usar com a tua família

1. Cria um projeto no [Firebase](https://console.firebase.google.com) com Firestore e Hosting.
2. Cola a configuração do projeto em `public/config.js`.
3. Troca `CODIGO_ADMIN` em `public/index.html`.
4. `firebase deploy`. Depois de o organizador entrar na app, põe o id dele (`p` + telemóvel) em
   `config/geral.adminId`, na consola do Firestore.

> As regras do Firestore são abertas: quem tiver o link e a configuração consegue ler e escrever.
> Serve para uma família; para algo maior, acrescenta Firebase Auth e regras por utilizador.

---
Feito com a ajuda do Claude. Os nomes e números da demo são fictícios.
