class Grafo {
    constructor() {
      this.adjacencia = new Map();
    }
  
    adicionarVertice(vertice) {
      if (!this.adjacencia.has(vertice)) {
        this.adjacencia.set(vertice, []);
      }
    }
  
    adicionarAresta(v1, v2) {
      this.adicionarVertice(v1);
      this.adicionarVertice(v2);
  
      this.adjacencia.get(v1).push(v2);
      this.adjacencia.get(v2).push(v1);
    }
  
    mostrar() {
      for (let [vertice, adjacentes] of this.adjacencia.entries()) {
        console.log(`${vertice} -> ${adjacentes.join(", ")}`);
      }
    }
  }
  
  module.exports = Grafo;
  