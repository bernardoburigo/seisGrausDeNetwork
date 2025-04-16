const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Grafo = require('./grafo/Grafo');

const app = express();
const grafo = new Grafo();
const atoresSet = new Set();


app.use(cors());
app.use(express.json());

function seedGrafo() { //função que alimenta o grafo por meio do json
  const filePath = path.join(__dirname, 'data', 'latest_movies.json');
  const rawData = fs.readFileSync(filePath);
  const movies = JSON.parse(rawData);

  movies.forEach(movie => {
    const filme = movie.title;
    grafo.adicionarVertice(filme);

    movie.cast.forEach(ator => {
      grafo.adicionarAresta(filme, ator);
      atoresSet.add(ator);
    });
  });
}


function bfs(grafo, inicio, destino) { //função de busca BFS (menor caminho)
  let fila = [[inicio]];
  let visitados = new Set();

  while (fila.length > 0) {
    let caminho = fila.shift();
    let atual = caminho[caminho.length - 1];

    if (atual === destino) return caminho;

    if (!visitados.has(atual)) {
      visitados.add(atual);

      let vizinhos = grafo.adjacencia.get(atual) || [];
      for (let vizinho of vizinhos) {
        if (!visitados.has(vizinho)) {
          fila.push([...caminho, vizinho]);
        }
      }
    }
  }

  return null;
}

function bfsTodosCaminhosStreaming(grafo, origem, destino, maxArestas, onEncontrado) { //função que busca todos os caminhos até 6 arestas com streaming SSE
  const fila = [[origem]];
  const caminhos = [];
  const visitadosGlobais = new Set();

  while (fila.length > 0) {
    const caminho = fila.shift();
    const ultimo = caminho[caminho.length - 1];

    if (caminho.length - 1 > maxArestas) continue;

    if (ultimo === destino) {
      const caminhoStr = caminho.join("->");
      if (!visitadosGlobais.has(caminhoStr)) {
        visitadosGlobais.add(caminhoStr);
        caminhos.push([...caminho]);
        onEncontrado([...caminho]);
      }
    }

    const vizinhos = grafo.adjacencia.get(ultimo) || [];
    for (const vizinho of vizinhos) {
      if (!caminho.includes(vizinho)) {
        fila.push([...caminho, vizinho]);
      }
    }
  }

  return caminhos;
}

seedGrafo(); //inicia

app.get('/atores', (req, res) => { //retorna atores em ordem alfabética
  const atoresOrdenados = Array.from(atoresSet).sort();
  res.json(atoresOrdenados);
});


app.post('/buscar', (req, res) => { //retorna o menor caminho entre dois atores
  const { origem, destino } = req.body;

  if (!origem || !destino) {
    return res.status(400).json({ erro: "Atores não informados." });
  }

  const caminho = bfs(grafo, origem, destino);
  if (caminho) {
    res.json({ caminho, graus: (caminho.length - 1) / 2 });
  } else {
    res.json({ erro: "Caminho não encontrado." });
  }
});

app.get('/buscar-todos-stream', (req, res) => { //retorna todos os caminhos entre dois atores até 6 arestas em tempo real via SSE
  const { origem, destino } = req.query;

  if (!origem || !destino) { //acaba não acontecendo, mantido mesmo assim
    res.status(400).write("event: error\ndata: Atores não informados.\n\n");
    res.end();
    return;
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  let caminhosEncontrados = 0;

  const callback = (caminho) => {
    caminhosEncontrados++;
    console.log(`Enviando caminho ${caminhosEncontrados}:`, caminho); //debug
    res.write(`event: caminho\ndata: ${JSON.stringify({ caminho, total: caminhosEncontrados })}\n\n`);
  };

  const caminhos = bfsTodosCaminhosStreaming(grafo, origem, destino, 6, callback);

  res.write(`event: done\ndata: ${JSON.stringify({ total: caminhos.length })}\n\n`);
  res.end();
});



const PORT = 3000; //inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
