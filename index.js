

const  {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const width = innerWidth*.99555;
const height = window.innerHeight*.99555;
const cellsHoriz = 10;
const cellsVert = 12;

const unitLengthX = width/cellsHoriz;
const unitLengthY = height/cellsVert;


const engine = Engine.create();
//disable gravity
engine.world.gravity.y=0;
const {world} = engine;


const render = Render.create({
  element: document.body,
  engine: engine,
  options:{
    wireframes: false,
    width,
    height
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);


const walls = [
  Bodies.rectangle(width/2, 0, width, 2,{isStatic: true}),
  Bodies.rectangle(width/2, height, width, 2, {isStatic: true}),
  Bodies.rectangle(0, height/2, 2, height,{isStatic: true}),
  Bodies.rectangle(width, height/2, 2, height, {isStatic: true})
];


//add to world object
World.add(world, walls);

//maze generation
const shuffle= (arr) => {

  let counter = arr.length;

  while (counter >0) {
    const index = Math.floor(Math.random() * counter);

    counter --;
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;

};


const grid = Array(cellsVert)
  .fill(null)
  .map(() => Array(cellsHoriz).fill(false));

//verticle walls
const verticle =Array(cellsVert)
.fill(null)
.map(() => Array(cellsHoriz -1).fill(false));

//horizontal walls
const horizontal = Array(cellsVert-1)
  .fill(null)
  .map(() => Array(cellsHoriz).fill(false));

const startRow = Math.floor(Math.random() * cellsVert);
const startCol = Math.floor(Math.random() * cellsHoriz);


//random wall generation
const mazeGeneration = (row, col) => {

  //if cell is visited then return
  if(grid[row][col]){
    return;
  }

  //mark this as visited
  grid[row][col] = true;

  //build ranomly ordered list of neighbors
  //wrapped with shuffle
  const neighbors= shuffle([
    [row-1, col, 'up'], 
    [row, col+1, 'right'], 
    [row+1, col, 'down'],
    [row, col-1, 'left'] 
  ]);

  //for each remaining neighbor, move it and remove wall between those 2 cells
  for (let neighbor of neighbors){
    const [nextRow, nextCol, direction] = neighbor;
      
      if (nextRow < 0 || nextRow >= cellsVert || nextCol < 0 || nextCol >= cellsHoriz){
        continue; //move on the next neighbor
      }
      //if neighbor has been visited dont check it
      if (grid[nextRow][nextCol]){
        continue;
      }

      if(direction === 'left'){
        verticle[row][col -1] = true;
      }
      else if(direction === 'right'){
        verticle[row][col] = true;
      } 
      else if(direction === 'up'){
        horizontal[row-1][col] = true;
      }
      else if(direction === 'down'){
        horizontal[row][col] = true;
      }
  //repeat
    mazeGeneration(nextRow, nextCol);
  }
}

mazeGeneration(startRow, startCol);

//create horizontal walls
horizontal.forEach((row, rowIndex)=>{
  row.forEach((open, columnIndex)=>{
    if(open){
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex* unitLengthX + unitLengthX/2,
      rowIndex* unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        isStatic: true,
        label: 'wall',
        render: {
          fillStyle : 'red'
        }
      }
    );
    World.add(world, wall);
  })
});

//create verticle walls
verticle.forEach((row, rowIndex)=>{
  row.forEach((open, columnIndex)=>{
    if(open){
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex* unitLengthX + unitLengthX,
      rowIndex* unitLengthY + unitLengthY/2,
      5,
      unitLengthY,
      {
        isStatic: true,
        label: 'wall',
        render: {
          fillStyle : 'red'
        }
      }
    );
    World.add(world, wall);
  })
});

//goal object
const goal = Bodies.rectangle(
  width - unitLengthX/2,
  height - unitLengthY/2,
  unitLengthX*.7,
  unitLengthY*.7,
  {
    isStatic: true,
    label: 'goal',
    render: {
      fillStyle : 'green'
    }
  }
);
World.add(world, goal);

const ballRadius = Math.min(unitLengthX, unitLengthY)/4;
//ball object
const ball = Bodies.circle(
  unitLengthX/2,
  unitLengthY/2,
  ballRadius,
  {
    label: 'ball',
    render: {
      fillStyle : 'blue'
    }
  }
);
World.add(world, ball);




//move ball
document.addEventListener('keydown', event => {
  const{x,y} = ball.velocity;

  if(event.keyCode === 87 || event.keyCode === 38){
    //up or W
    Body.setVelocity(ball, {x, y: y-5});
  }
  if(event.keyCode === 68 || event.keyCode === 39){
    //right or A
    Body.setVelocity(ball, {x: x+5, y});
  }
  if(event.keyCode === 83 || event.keyCode === 40){
    //down or S
    Body.setVelocity(ball, {x, y: y+5});
  }
  if(event.keyCode === 65 || event.keyCode === 37){
    //left or D
    Body.setVelocity(ball, {x: x-5, y});
  }
});


//win condition
Events.on(engine, 'collisionStart', event=> {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];
    if (labels.includes(collision.bodyA.label) &&
        labels.includes(collision.bodyB.label)){
          document.querySelector('.winner').classList.remove('hidden');
          engine.world.gravity.y =1;
          world.bodies.forEach(body => {
            if (body.label === 'wall'){
              Body.setStatic(body, false);
            }
          })
    }
  });
});





