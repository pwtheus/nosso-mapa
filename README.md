# Nosso mapa

Um presente de dois meses de namoro. HTML, CSS e JavaScript, sem build, backend ou dependências JavaScript. Fontes e fotos ficam no próprio site. O caminho acompanha o scroll nativo; movimento reduzido é respeitado.

## Visualizar

Na pasta do projeto, rode `python -m http.server 8000` e abra http://localhost:8000. A validação SHA-256 usa Web Crypto e requer HTTPS ou localhost. O GitHub Pages oferece HTTPS.

## Editar

- `content.js`: textos, momentos, datas, contadores e fotos. Datas usam `AAAA-MM-DD`; uma data vazia não é exibida. `fotos: []` deixa o momento textual.
- Cada foto tem `src`, `alt`, `width` e `height`. Os caminhos são relativos. Coloque novas imagens WebP em `images/`, remova metadados e atualize as dimensões.
- De 2 a 4 fotos, toque na foto para espalhar/recolher. Mais de 4: botões ou gesto horizontal.
- `style.css`: paleta, fontes, espaçamentos e animações.
- Contadores usam o fuso `America/Cuiaba`, meia-noite nas datas iniciais, meses de calendário e dias reais. A data do presente permanece fixa.

## Senha

A tela é uma surpresa simbólica. As fotos e o código de um site estático público podem ser acessados sem passar pela senha. O hash não transforma o site em uma área privada.

Para trocar, gere um SHA-256 da nova data no formato DDMMAAAA e substitua `passwordHash` em `content.js`. Com Node instalado:

```sh
node -e "console.log(require('node:crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" SUA_DATA_DDMMAAAA
```

O formato curto DDMMAA é expandido para o século 2000. Para outras datas, use oito dígitos.

## Música

O áudio enviado em MP4 foi extraído para `audio/mrs-magic.m4a` (AAC 128 kb/s). Ele começa após tocar em “Bora”, repete e pode ser pausado no botão ♫. Não é baixado antecipadamente. Edite `music` em `content.js` para trocar arquivo, título ou volume. Alguns celulares controlam o volume pelo próprio aparelho.

## Publicar no GitHub Pages

Crie um repositório, depois execute nesta pasta (substitua a URL se necessário):

```sh
git init -b main
git add .
git commit -m "Cria nosso mapa"
git remote add origin https://github.com/pwtheus/nosso-mapa.git
git push -u origin main
```

Em Settings → Pages, escolha Deploy from a branch, `main`, `/ (root)` e salve. Aguarde a publicação. O endereço esperado é https://pwtheus.github.io/nosso-mapa/.

Não envie o ZIP nem os originais. As sete fotos desta entrega foram orientadas corretamente, convertidas em WebP de qualidade 80, limitadas a 1600 px de largura e salvas sem metadados. O momento final não tem foto.

## Verificação

Execute `node --check script.js`, `node --check content.js` e `node tests.cjs`. O arquivo `tests.cjs` verifica os casos de calendário, a normalização da data e a presença das sete fotos, áudio e fontes. Abra também no celular para conferir o enquadramento e as animações.
