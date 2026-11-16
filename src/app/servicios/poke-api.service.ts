import { Injectable } from '@angular/core';

export interface Pokemon {
  name: string;
  sprites: { front_default: string | null };
  types: { type: { name: string } }[];
  species: { name: string; url: string };
}
export interface EspeciePokemon {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
  }[];
  evolution_chain: { url: string } | null;
}
export interface NodoEvolucion {
  species: { name: string };
  evolution_details: Record<string, unknown>[];
  evolves_to: NodoEvolucion[];
}

export interface CadenaEvolutiva {
  chain: NodoEvolucion;
}
@Injectable({ providedIn: 'root' })
export class PokeApiService {
  async obtenerPokemon(nombre: string): Promise<Pokemon> {
    const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nombre)}/`;
    const respuesta = await fetch(url).catch(() => {
      throw new Error('No se pudo conectar con PokéAPI.');
    });

    if (respuesta.status === 404) {
      throw new Error(`No se encontró un Pokémon llamado ${nombre}.`);
    }

    if (!respuesta.ok) {
      throw new Error('PokéAPI no pudo completar la consulta.');
    }

    const pokemon: Pokemon = await respuesta.json();
    return pokemon;
  }
  async obtenerEspecie(url: string): Promise<EspeciePokemon> {
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la información de la especie.');
  }

  const especie: EspeciePokemon = await respuesta.json();
  return especie;
}
async obtenerCadena(url: string): Promise<CadenaEvolutiva> {
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la cadena evolutiva.');
  }

  const cadena: CadenaEvolutiva = await respuesta.json();
  return cadena;
}
}