const $textInput = document.querySelector('.text-input') as HTMLInputElement;
const $form = document.querySelector('form') as HTMLFormElement;
const $guessRow = document.querySelector('.guess-row') as HTMLDivElement;
const $scrollbox = document.querySelector('.scrollbox') as HTMLDivElement;
const $winModal = document.querySelector('.win-modal') as HTMLDialogElement;
const $modalSprite = document.querySelector(
  '.modal-sprite',
) as HTMLImageElement;
const $modalName = document.querySelector('.modal-name') as HTMLDivElement;
const $closeModalButton = document.querySelector(
  '.close-modal',
) as HTMLButtonElement;
if (!$textInput) throw new Error('$textInput query failed');
if (!$form) throw new Error('$form query failed');
if (!$guessRow) throw new Error('$guessRow query failed');
if (!$scrollbox) throw new Error('$scrollbox query failed');
if (!$winModal) throw new Error('$winModal query failed');
if (!$modalSprite) throw new Error('$modalSprite query failed');
if (!$modalName) throw new Error('$modalName query failed');
if (!$closeModalButton) throw new Error('$closeModalButton query failed');
interface PokemonTypes {
  slot: number;
  type: { name: string; url: string };
}

interface PokemonSpecies {
  evolution_chain: { url: string };
}

interface PokemonEvoChain {
  chain: {
    species: { name: string };
    evolves_to: [
      {
        species: { name: string };
        evolves_to: [{ species: { name: string } }];
      },
    ];
  };
}

interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypes[];
  sprites: {
    front_default: string;
  };
}

interface GamePokemon {
  name: string;
  height: number;
  weight: number;
  types: string[];
  generation: number;
  stage: number;
  sprites: string;
  isSolved?: boolean;
}

interface GuessBGColor {
  pokemonBGColor: string;
  type1BGColor: string;
  type2BGColor: string;
  weightBG: string;
  heightBG: string;
  generationBG: string;
  evoStageBG: string;
}

const guessPokemon = {} as GamePokemon;
const guesses = [];
let guessBGColor: GuessBGColor = {
  pokemonBGColor: '',
  type1BGColor: '',
  type2BGColor: '',
  weightBG: '',
  heightBG: '',
  generationBG: '',
  evoStageBG: '',
};

const randomNum = Math.random();
const randomPokeNum = (randomNum * 1000).toFixed(0);

async function fetchData(
  pokemon: GamePokemon,
  pokeId: number | string,
): Promise<void> {
  try {
    const fetchResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokeId}`,
    );
    if (!fetchResponse.ok) {
      throw new Error(`HTTP Error! Status: ${fetchResponse}`);
    }

    const data = (await fetchResponse.json()) as Pokemon;
    const { id, name, height, weight, types, sprites } = data;
    const typeNames = types.map((typeInfo) => typeInfo.type.name);
    pokemon.name = name;
    pokemon.height = height;
    pokemon.weight = weight;
    pokemon.types = typeNames;
    pokemon.sprites = sprites.front_default;
    if (pokemon.types.length < 2) {
      pokemon.types.push('N/A');
    }
    handleRegion(id, pokemon);
    await fetchEvoChain(
      `https://pokeapi.co/api/v2/pokemon-species/${id}/`,
      name,
      pokemon,
    );
    mysteryPokemonLocalStorage();
  } catch (error) {
    console.error('Error: ', error);
  }
}

async function fetchEvoChain(
  evoSpeciesUrl: string,
  name: string,
  pokemon: GamePokemon,
): Promise<void> {
  try {
    const chainResponse = await fetch(evoSpeciesUrl);
    if (!chainResponse.ok) {
      throw new Error(`HTTP Error! Status: ${chainResponse}`);
    }
    const EvoChainData = (await chainResponse.json()) as PokemonSpecies;
    await fetchEvoStage(EvoChainData.evolution_chain.url, name, pokemon);
  } catch (error) {
    console.error('Error: ', error);
  }
}

async function fetchEvoStage(
  evoChainUrl: string,
  name: string,
  pokemon: GamePokemon,
): Promise<void> {
  try {
    const chainResponse = await fetch(evoChainUrl);
    if (!chainResponse.ok) {
      throw new Error(`HTTP Error! Status: ${chainResponse}`);
    }
    const speciesData = (await chainResponse.json()) as PokemonEvoChain;
    let stageNum = 1;
    if (
      speciesData.chain.species.name &&
      speciesData.chain.species.name === name
    ) {
      // const firstStage = speciesData.chain.species.name;
      stageNum = 1;
      pokemon.stage = stageNum;
    }
    if (
      speciesData.chain.evolves_to[0].species.name &&
      speciesData.chain.evolves_to[0].species.name === name
    ) {
      // const secondStage = speciesData.chain.evolves_to[0].species.name;
      stageNum = 2;
      pokemon.stage = stageNum;
    }

    if (
      speciesData.chain.evolves_to[0].evolves_to[0].species.name &&
      speciesData.chain.evolves_to[0].evolves_to[0].species.name === name
    ) {
      // const thirdStage =
      //   speciesData.chain.evolves_to[0].evolves_to[0].species.name;
      stageNum = 3;
      pokemon.stage = stageNum;
    }
  } catch (error) {
    console.error('Error: ', error);
  }
}

function handleRegion(num: number, pokemon: GamePokemon): void {
  let generation = 0;
  if (num >= 1 && num <= 151) {
    generation = 1;
  } else if (num >= 152 && num <= 251) {
    generation = 2;
  } else if (num >= 252 && num <= 386) {
    generation = 3;
  } else if (num >= 387 && num <= 493) {
    generation = 4;
  } else if (num >= 494 && num <= 649) {
    generation = 5;
  } else if (num >= 650 && num <= 719) {
    generation = 6;
  } else if (num >= 722 && num <= 809) {
    generation = 7;
  } else if (num >= 810 && num <= 905) {
    generation = 8;
  } else if (num >= 906 && num <= 1025) {
    generation = 9;
  }
  pokemon.generation = generation;
}

function mysteryPokemonLocalStorage() {
  if (!mysteryPokemon.isSolved) {
    mysteryPokemon.isSolved = false;
    writeData(mysteryPokemon);
    console.log('mysteryPokemon isSolved === undefined: ', mysteryPokemon);
  } else if (mysteryPokemon.isSolved === true) {
    mysteryPokemon.isSolved = false;
    writeData(mysteryPokemon);
    console.log('mysteryPokemon isSolved === true: ', mysteryPokemon);
  }
}
$form.addEventListener('submit', handleSubmit);

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const guessPokemonText = $textInput.value;
  $form.reset();
  await fetchData(guessPokemon, guessPokemonText);
  console.log('guessPokemon: ', guessPokemon);
  compareAnswer(mysteryPokemon, guessPokemon);
}

$winModal.addEventListener('click', (event: Event) => {
  const eventTarget = event.target;
  if (eventTarget === $closeModalButton) {
    $winModal.style.display = 'none';
    $winModal.close();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  $winModal.style.display = 'none';
  if (mysteryPokemon.isSolved === undefined) {
    fetchData(mysteryPokemon, randomPokeNum);
  }
});

function compareAnswer(mysteryPokemon: GamePokemon, guessPokemon: GamePokemon) {
  if (guessPokemon.name === mysteryPokemon.name) {
    guessBGColor.pokemonBGColor = '#02D000';
  } else {
    guessBGColor.pokemonBGColor = '#E90D06';
  }
  if (
    (guessPokemon.types[0] &&
      guessPokemon.types[0] === mysteryPokemon.types[0]) ||
    guessPokemon.types[0] === mysteryPokemon.types[1]
  ) {
    guessBGColor.type1BGColor = 'url("http://localhost:5500/images/green.png")';
  } else {
    guessBGColor.type1BGColor = 'url("http://localhost:5500/images/red.png")';
  }
  if (
    (guessPokemon.types[1] &&
      guessPokemon.types[1] === mysteryPokemon.types[0]) ||
    guessPokemon.types[1] === mysteryPokemon.types[1]
  ) {
    guessBGColor.type2BGColor = 'url("http://localhost:5500/images/green.png")';
  } else {
    guessBGColor.type2BGColor = 'url("http://localhost:5500/images/red.png")';
  }
  if (guessPokemon.weight === mysteryPokemon.weight) {
    guessBGColor.weightBG = 'url("http://localhost:5500/images/green.png")';
  } else if (guessPokemon.weight > mysteryPokemon.weight) {
    guessBGColor.weightBG = 'url("http://localhost:5500/images/red-down.png")';
  } else if (guessPokemon.weight < mysteryPokemon.weight) {
    guessBGColor.weightBG = 'url("http://localhost:5500/images/red-up.png")';
  }
  if (guessPokemon.height === mysteryPokemon.height) {
    guessBGColor.heightBG = 'url("http://localhost:5500/images/green.png")';
  } else if (guessPokemon.height > mysteryPokemon.height) {
    guessBGColor.heightBG = 'url("http://localhost:5500/images/red-down.png")';
  } else if (guessPokemon.height < mysteryPokemon.height) {
    guessBGColor.heightBG = 'url("http://localhost:5500/images/red-up.png")';
  }
  if (guessPokemon.generation === mysteryPokemon.generation) {
    guessBGColor.generationBG = 'url("http://localhost:5500/images/green.png")';
  } else if (guessPokemon.generation > mysteryPokemon.generation) {
    guessBGColor.generationBG =
      'url("http://localhost:5500/images/red-down.png")';
  } else if (guessPokemon.generation < mysteryPokemon.generation) {
    guessBGColor.generationBG =
      'url("http://localhost:5500/images/red-up.png")';
  }
  if (guessPokemon.stage === mysteryPokemon.stage) {
    guessBGColor.evoStageBG = 'url("http://localhost:5500/images/green.png")';
  } else if (guessPokemon.stage > mysteryPokemon.stage) {
    guessBGColor.evoStageBG =
      'url("http://localhost:5500/images/red-down.png")';
  } else if (guessPokemon.stage < mysteryPokemon.stage) {
    guessBGColor.evoStageBG = 'url("http://localhost:5500/images/red-up.png")';
  }
  renderGuess(guessPokemon);
  winModal(guessBGColor.pokemonBGColor);
}

function renderGuess(pokemon: GamePokemon): HTMLElement {
  const $divGuessRow = document.createElement('div');
  $divGuessRow.setAttribute('class', 'row guess-row');
  const $divGuessName = document.createElement('div');
  $divGuessName.setAttribute('class', 'guess-name');
  $divGuessName.textContent = pokemon.name;
  const $divGuessSprite = document.createElement('div');
  $divGuessSprite.setAttribute('class', 'guess-square sprite');
  $divGuessSprite.style.backgroundColor = guessBGColor.pokemonBGColor;
  $divGuessSprite.style.backgroundImage = `url("${guessPokemon.sprites}")`;
  const $divGuessSquareTypes = document.createElement('div');
  $divGuessSquareTypes.setAttribute('class', 'guess-square types');
  const $divType1 = document.createElement('div');
  $divType1.setAttribute('class', 'type1');
  $divType1.setAttribute(
    'style',
    `background-image: ${guessBGColor.type1BGColor}`,
  );
  $divType1.textContent = pokemon.types[0];
  // for(let i = 0; i < guessPokemon.types.length; i++){
  // if(guessPokemon.types[i] === 'electric'|| guessPokemon.types[i] === 'fighting'){
  //   $divType1.style.letterSpacing = '-1.1px'
  // }
  const $divType2 = document.createElement('div');
  $divType2.setAttribute('class', 'type2');
  $divType2.setAttribute(
    'style',
    `background-image: ${guessBGColor.type2BGColor}`,
  );
  $divType2.textContent = pokemon.types[1];
  //   for(let i = 0; i < guessPokemon.types.length; i++){
  //   if(guessPokemon.types[i] === 'electric' || guessPokemon.types[i] === 'fighting'){
  //     $divType2.style.letterSpacing = '-1.1px'
  //   }
  // }
  const $divGuessSquareWeight = document.createElement('div');
  $divGuessSquareWeight.setAttribute('class', 'guess-square weight');
  $divGuessSquareWeight.setAttribute(
    'style',
    `background-image: ${guessBGColor.weightBG}`,
  );
  $divGuessSquareWeight.textContent = `${(pokemon.weight * 0.1).toFixed(1)} kg`;
  const $divGuessSquareHeight = document.createElement('div');
  $divGuessSquareHeight.setAttribute('class', 'guess-square height');
  $divGuessSquareHeight.setAttribute(
    'style',
    `background-image: ${guessBGColor.heightBG}`,
  );
  $divGuessSquareHeight.textContent = `${(pokemon.height * 0.1).toFixed(2)} meters`;
  const $divGuessSquareGen = document.createElement('div');
  $divGuessSquareGen.setAttribute('class', 'guess-square gen');
  $divGuessSquareGen.setAttribute(
    'style',
    `background-image: ${guessBGColor.generationBG}`,
  );
  $divGuessSquareGen.textContent = `Gen ${pokemon.generation}`;
  const $divGuessSquareStage = document.createElement('div');
  $divGuessSquareStage.setAttribute('class', 'guess-square stage');
  $divGuessSquareStage.setAttribute(
    'style',
    `background-image: ${guessBGColor.evoStageBG}`,
  );
  $divGuessSquareStage.textContent = `Stage ${pokemon.stage}`;

  $scrollbox.prepend($divGuessRow);
  $divGuessRow.append($divGuessName);
  $divGuessRow.append($divGuessSprite);
  $divGuessRow.append($divGuessSquareTypes);
  $divGuessSquareTypes.append($divType1);
  $divGuessSquareTypes.append($divType2);
  $divGuessRow.append($divGuessSquareWeight);
  $divGuessRow.append($divGuessSquareHeight);
  $divGuessRow.append($divGuessSquareGen);
  $divGuessRow.append($divGuessSquareStage);
  return $divGuessRow;
}

function renderModal() {
  $modalSprite.src = mysteryPokemon.sprites;
  $modalName.textContent = mysteryPokemon.name;
}

function winModal(winColor: string) {
  if (winColor === '#02D000') {
    $winModal.style.display = '';
    renderModal();
    $winModal.showModal();
  }
}
