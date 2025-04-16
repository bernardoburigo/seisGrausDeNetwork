class Grafo {
    constructor() {
      this.adjacencia = new Map();
    }
  
    adicionarVertice(vertice) { //adiciona vértice caso não exista
      if (!this.adjacencia.has(vertice)) {
        this.adjacencia.set(vertice, []);
      }
    }
  
    adicionarAresta(v1, v2) { //adiciona aresta entre dois vertices existentes
      this.adicionarVertice(v1);
      this.adicionarVertice(v2);
  
      this.adjacencia.get(v1).push(v2);
      this.adjacencia.get(v2).push(v1);
    }
  
    mostrar() { //exibe o grafo no console
      for (let [vertice, adjacentes] of this.adjacencia.entries()) {
        console.log(`${vertice} -> ${adjacentes.join(", ")}`);
      }
    }
  }
  
  module.exports = Grafo;
  