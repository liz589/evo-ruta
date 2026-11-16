import { BuscadorPokemon } from './buscador-pokemon/buscador-pokemon';
import { Component, signal } from '@angular/core';

@Component({
  imports: [BuscadorPokemon],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('evo-ruta');
}
