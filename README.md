# EvoRuta

Aplicación web hecha con Angular que permite buscar un Pokémon, consultar su ficha y explorar las rutas hacia sus evoluciones.

## Funcionalidades

- Búsqueda por nombre con imagen, tipos y descripción de la especie.
- Selección de un destino para ver la ruta y los requisitos de cada evolución.
- Mensajes de carga, error y Pokémon inexistente.

## Endpoints de PokéAPI

| Endpoint | Uso en EvoRuta |
|---|---|
| `/pokemon/{nombre}/` | Obtiene la imagen, los tipos y `species.url`. |
| `/pokemon-species/{id}/` | Obtiene la descripción de la especie y `evolution_chain.url`. |
| `/evolution-chain/{id}/` | Obtiene las ramas de evolución y los requisitos de cada paso. |

## Ejecución local

Con Node.js y npm instalados, ejecuta desde la carpeta del proyecto.

```bash
npm ci
npm start
```

Abre [http://localhost:4200](http://localhost:4200/).

## Aplicación publicada

[Abrir EvoRuta](https://evo-ruta.vercel.app/)