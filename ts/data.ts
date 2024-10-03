/* exported data, writeData, readData */

let mysteryPokemon: GamePokemon = readData();

function writeData(Pokemon: GamePokemon): void {
  const dataJSON = JSON.stringify(Pokemon);
  localStorage.setItem('pokemon-storage', dataJSON);
}

function readData(): GamePokemon {
  const pokemonStorage = localStorage.getItem('pokemon-storage');
  if (pokemonStorage !== null) {
    console.log('JSON.parse(pokemonStorage): ', JSON.parse(pokemonStorage));
    return JSON.parse(pokemonStorage);
  } else {
    return {
      name: '',
      height: 0,
      weight: 0,
      types: [''],
      generation: 0,
      stage: 0,
      sprites: '',
    };
  }
}
