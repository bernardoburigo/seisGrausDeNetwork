const fs = require('fs');
const path = require('path');
const Grafo = require('./grafo/Grafo');

const grafo = new Grafo();

function seedGrafo() {
  const filePath = path.join(__dirname, 'data', 'latest_movies.json');
  const rawData = fs.readFileSync(filePath);
  const movies = JSON.parse(rawData);

  movies.forEach(movie => {
    const filme = movie.title;
    grafo.adicionarVertice(filme);

    movie.cast.forEach(ator => {
      grafo.adicionarAresta(filme, ator);
    });
  });
}

seedGrafo();

function bfs(grafo, atorOrigem, atorDestino) {
  let fila = [[atorOrigem]];
  let visitados = new Set();

  while (fila.length > 0) {
    let caminho = fila.shift();
    let ultimoAtor = caminho[caminho.length - 1];

    if (ultimoAtor === atorDestino) {
      console.log(`Caminho encontrado (${caminho.length - 1} graus de separação):`);
      console.log(caminho.join(" -> "));
      return caminho;
    }

    if (!visitados.has(ultimoAtor)) {
      visitados.add(ultimoAtor);

      let vizinhos = grafo[ultimoAtor] || [];
      for (let vizinho of vizinhos) {
        if (!visitados.has(vizinho)) {
          fila.push([...caminho, vizinho]);
        }
      }
    }
  }

  console.log("Nenhum caminho encontrado.");
  return null;
}

const caminho = bfs(grafo, "Timothée Chalamet", "Zendaya");
