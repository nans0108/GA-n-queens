var config = new Object();
config.popSize = 800;
config.maxGenerations = 50;
config.maxRuns = 1;
config.mutateProb = 0.05;
config.selection = "rank";
config.numberOfQueens = 20;
var stop_running = true;
var runTimeout = 0;
var run;

var generation;

function rungeneticAlgorithm(n) {
  generation = 0;
	population = new Array();

  for (var i=0; i<n; i++) {
    let object = new Object()
    object.chromosome = generateChromosome(n);
    object.fitness = 0;

    population.push(object)
  }
  stop_running = false;
  iterGA();
}

function iterGA() {
  //sort population by fitness
  population.sort( function (a,b) { return a.fitness-b.fitness });

  if (generation > 0) {
    console.log('generation: ', generation);
    console.log('Best fitness so far: ', population[population.length-1].fitness);
  }

  if (config.maxGenerations == generation){
    console.log('generation: ', generation);
    console.log('Best chromosome', population[population.length-1].chromosome);
    console.log('Best fitness: ', population[population.length-1].fitness);
    return true;
  }

  for(var i = 0; i<population.length; i++){
    population[i].fitness = measureFitness(population[i].chromosome);
  }

  var newPopulation = new Array();
  for(var i = 0;i<population.length;){
    var rnum = Math.ceil(Math.random() * 3);
    switch(rnum){
      case 1:
        var individual = population[selectChromosomeFromPopulation()];
        //perform reproduction
        var newIndividual = new Object();
        newIndividual.chromosome = individual.chromosome.slice();
        newIndividual.fitness = individual.fitness;
        //insert copy in new pop
        newPopulation.push(newIndividual)
          i++;
        break;
      case 2:
        var individual1 = population[selectChromosomeFromPopulation()];
        var individual2 = population[selectChromosomeFromPopulation()];
        //perform crossover
        var child1 = new Object();
        var child2 = new Object();
        var xover = Math.floor(Math.random()*individual1.chromosome.length);
        child1.chromosome = individual1.chromosome.slice(0,xover).concat(individual2.chromosome.slice(xover));
        child2.chromosome = individual2.chromosome.slice(0,xover).concat(individual1.chromosome.slice(xover));
        child1.fitness = measureFitness(child1.chromosome);
        child2.fitness = measureFitness(child2.chromosome);

        var candidates = new Array();
        candidates.push(individual1);
        candidates.push(individual2);
        candidates.push(child1);
        candidates.push(child2);

        candidates.sort( function (a,b) { return a.fitness-b.fitness });
        //insert offspring in new pop
        newPopulation.push(candidates[2])
          i++;
        newPopulation.push(candidates[3])
          i++;
        break;
      case 3:
        var individual = population[selectChromosomeFromPopulation()];
        //perform mutation
        var mutant = new Object();
        mutant.chromosome = individual.chromosome.slice();
        var r = Math.random();
        var x1 = Math.floor(Math.random()*mutant.chromosome.length);
        var x2 = Math.floor(Math.random()*mutant.chromosome.length);
        if(r < 0.5){
          //Mutate 1 - reciprocal exchange
          var temp = mutant.chromosome[x1];
          mutant.chromosome[x1] = mutant.chromosome[x2];
          mutant.chromosome[x2] = temp;
        }else{
          //Mutate 2 - insertion
          var tempC = mutant.chromosome.splice(x1,1);
          var tempA = mutant.chromosome.splice(x2);
          mutant.chromosome = mutant.chromosome.concat(tempC.concat(tempA));
        }
        mutant.fitness = measureFitness(mutant.chromosome);
        //insert mutant in new pop
        newPopulation.push(mutant)
          i++;
        break;
      default:
    }
  }
  population = newPopulation;
  generation++;

  if(!stop_running){
    runTimeout = setTimeout(iterGA, 50);
  }
}

function generateChromosome(n) {
  let chromosome = new Array();
  for (var i=0; i<n; i++) chromosome.push(Math.floor(Math.random() * Math.floor(n)));
  return chromosome;
}


function measureFitness(chromosome) {
  let collisions = 0;

  for (var i=0; i<chromosome.length; i++) {
    for (var j=i+1; j<chromosome.length; j++) {
      if (checkForConflict(i, chromosome[i], j, chromosome[j])) {
        collisions++;
      }
    }
  }
  return 1 / collisions * 1000;
}

function checkForConflict(x1, y1, x2, y2) {return (isDiagonalConflict(x1, y1, x2, y2) || isAcrossConflict(x1, y1, x2, y2))};

function isDiagonalConflict(x1, y1, x2, y2) {return ((x1 - y1 == x2 - y2) || (x1 + y1 == x2 + y2)) ? true : false};

function isAcrossConflict(x1, y1, x2, y2) {return (x1 == x2 || y1 == y2) ? true : false};

function selectChromosomeFromPopulation(){
	switch(config.selection){
		case "tournament":
			var choices = new Array();
			for(var i = 0;i<5;i++){
				var rnum = Math.floor(Math.random() * population.length);
				choices[i] = population[rnum];
				choices[i].index = rnum;
			}
			choices.sort( function (a,b) { return a.fitness-b.fitness });
			var r = Math.random();
			//p = 0.5
			if(r < 0.5){
				//return most fit
				return choices[choices.length-1].index;
			}
			//otherwise, return a random choice
			var rnum = Math.floor(Math.random() * choices.length);
			return choices[rnum].index;
			break;
		case "rank":
			var r = Math.random()*((population.length*(population.length+1))/2);
			var sum = 0;
			for(var i = 0;i<population.length;i++){
				for (sum += i; sum > r; r++) return i;
			}
			return population.length-1;
			break;
		default:
			return 1;
	}
}

console.log(rungeneticAlgorithm(config.numberOfQueens));
