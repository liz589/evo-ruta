import { Component, computed, inject, signal } from '@angular/core';
import {
  PokeApiService,
  type EspeciePokemon,
  type NodoEvolucion,
  type Pokemon,
} from '../servicios/poke-api.service';

interface RutaEvolutiva {
  destino: string;
  pasos: NodoEvolucion[];
}
@Component({
  imports: [],
  selector: 'app-buscador-pokemon',
  styleUrl: './buscador-pokemon.css',
  templateUrl: './buscador-pokemon.html',
})
export class BuscadorPokemon {
  private readonly pokeApi = inject(PokeApiService);

  pokemon = signal<Pokemon | null>(null);
  especie = signal<EspeciePokemon | null>(null);
  rutas = signal<RutaEvolutiva[]>([]);
  destinoElegido = signal('');

  rutaSeleccionada = computed(() =>
    this.rutas().find((ruta) => ruta.destino === this.destinoElegido()),
  );

  descripcion = computed(() => {
    const textos = this.especie()?.flavor_text_entries ?? [];
    const enEspanol = textos.find(
      (texto) => texto.language.name === 'es' || texto.language.name === 'es-419',
    );
    const entrada = enEspanol ?? textos.find((texto) => texto.language.name === 'en');

    return entrada?.flavor_text.replace(/\s+/g, ' ').trim() || 'Descripción no disponible.';
  });
  cargando = signal(false);
  error = signal('');

  async buscar(texto: string, evento: Event): Promise<void> {
    evento.preventDefault();

    if (this.cargando()) {
      return;
    }

    const nombre = texto.trim().toLowerCase();
    this.pokemon.set(null);
    this.especie.set(null);
    this.rutas.set([]);
    this.destinoElegido.set('');
    this.error.set('');

    if (!nombre) {
      this.error.set('Escribe el nombre de un Pokémon.');
      return;
    }

    this.cargando.set(true);

    try {
      const resultado = await this.pokeApi.obtenerPokemon(nombre);
      this.pokemon.set(resultado);
      const especie = await this.pokeApi.obtenerEspecie(resultado.species.url);
      this.especie.set(especie);
      const urlCadena = especie.evolution_chain?.url;

      if (urlCadena) {
        const cadena = await this.pokeApi.obtenerCadena(urlCadena);
        this.rutas.set(this.rutasDesde(cadena.chain, resultado.species.name));
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Ocurrió un error al buscar.';
      this.error.set(mensaje);
    } finally {
      this.cargando.set(false);
    }
  }
  private rutasDesde(
    nodo: NodoEvolucion,
    origen: string,
    pasosPrevios: NodoEvolucion[] = [],
  ): RutaEvolutiva[] {
    const nombre = nodo.species.name;
    const rutaIniciada = pasosPrevios.length > 0 || nombre === origen;
    const pasos = rutaIniciada ? [...pasosPrevios, nodo] : [];

    const rutasHijas = nodo.evolves_to.flatMap((hijo) =>
      this.rutasDesde(hijo, origen, pasos),
    );


    return pasos.length > 1 ? [{ destino: nombre, pasos }, ...rutasHijas] : rutasHijas;
  }
  private readonly etiquetasRequisito: Record<string, string> = {
    trigger: 'Método',
    item: 'Objeto',
    held_item: 'Objeto equipado',
    min_level: 'Nivel mínimo',
    min_happiness: 'Amistad mínima',
    min_affection: 'Afecto mínimo',
    known_move: 'Movimiento conocido',
    known_move_type: 'Tipo de movimiento conocido',
    time_of_day: 'Momento del día',
    version_group: 'Introducido en',
    required_pokemon_form: 'Forma inicial',
    evolved_pokemon_form: 'Forma final',
  };

  private readonly nombresRequisito: Record<string, string> = {
    'level-up': 'Subir de nivel',
    'use-item': 'Usar objeto',
    trade: 'Intercambiar',
    'water-stone': 'Piedra Agua',
    'fire-stone': 'Piedra Fuego',
    'thunder-stone': 'Piedra Trueno',
    day: 'día',
    night: 'noche',
    fairy: 'Hada',
  };

  describirRequisito(detalle: Record<string, unknown>): string {
    const partes: string[] = [];

    for (const [campo, valor] of Object.entries(detalle)) {
      if (campo === 'is_default' || valor == null || valor === false || valor === '') {
        continue;
      }

      const texto = this.valorRequisito(valor);
      if (texto) {
        const etiqueta = this.etiquetasRequisito[campo] ?? campo.replace(/_/g, ' ');
        partes.push(`${etiqueta}: ${texto}`);
      }
    }

    return partes.join(' · ') || 'Requisitos sin registrar en PokéAPI.';
  }

  private valorRequisito(valor: unknown): string {
    if (Array.isArray(valor)) {
      return valor.map((elemento) => this.valorRequisito(elemento)).join(', ');
    }

    if (valor !== null && typeof valor === 'object') {
      if ('name' in valor && typeof valor.name === 'string') {
        return this.valorRequisito(valor.name);
      }

      return JSON.stringify(valor) ?? '';
    }

    if (typeof valor === 'string') {
      return this.nombresRequisito[valor] ?? valor.replace(/-/g, ' ');
    }

    return valor === true ? 'Sí' : String(valor);
  }
}

