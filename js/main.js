

  const CAMERA_ANGLES = [
    [[0, -20, 10],[0.5, 0, 0]],
    [[0, -10, 3],[0.6, 0, 0]],
    [[0, 0, 20],[0, 0, 0]],
    [[0, 0, 0],[.7, 0, 0]]
  ];
  var renderer = undefined,
      camera = undefined,
      scene = undefined,
      keyAxis = [0,0],
      keyActions = [0],
      timeStep=1/60,

  // Render
      mazeDimension = 10,
      startTime = 0,
      timer = 0,
      didEnd = true,
      timebox = undefined,
      control = "ball",
      bestTime = "00.00",
      camAngle = 0,
      cameraPosition = CAMERA_ANGLES[camAngle][0],
      camQuat = CAMERA_ANGLES[camAngle][1],
      lookDir = 0,
      player = undefined,
      ballMesh = undefined,
      mazeMesh = undefined,

  // Cannon world Vars
      world = undefined,
      ball = undefined,
      body = undefined,
      maze = undefined,
      groundBody = undefined;

  function initCannon() {
    //Create World
    world = new CANNON.World();
    world.gravity.set(0,0,-50);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    //Create Ball
    let shape = new CANNON.Sphere(1);
    body = new CANNON.Body({
      mass: 500,
    });
    body.addShape(shape);
    body.position.set(0,-5,14);

    //Create Maze
    const obj = new CANNON.Box(new CANNON.Vec3(4, 10, 2));
    const obj2 = new CANNON.Box(new CANNON.Vec3(10, 4, 2));
    const obj3 = new CANNON.Box(new CANNON.Vec3(4,18,2));
    const obj4 = new CANNON.Box(new CANNON.Vec3(18,4,2));
    const obj5 = new CANNON.Box(new CANNON.Vec3(2,5,2));
    maze = new CANNON.Body({mass: 0});
    maze.addShape(obj);
    maze.addShape(obj2, new CANNON.Vec3( 6, 14, 0));
    maze.addShape(obj3, new CANNON.Vec3( 20, 0, 0));
    maze.addShape(obj4, new CANNON.Vec3( 6, -22, 0));
    maze.addShape(obj5, new CANNON.Vec3(-10, -13, 0));
    maze.position.set(0,0,10);

    //Create Ground
    var groundShape = new CANNON.Plane();
    groundBody = new CANNON.Body({ mass: 0, shape: groundShape });

    //Add bodies
    world.addBody(body);
    world.addBody(groundBody);
    world.addBody(maze);

  }

  function createRender() {
    const loader = new THREE.TextureLoader();
    //Create scene
    scene = new THREE.Scene();

    // Add the camera.
    var aspect = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(...cameraPosition);
    scene.add(camera);

    camera.quaternion.x = camQuat[0];
    camera.quaternion.y = camQuat[1];
    camera.quaternion.z = camQuat[2];

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add(light);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 2, 5, 15 );
    directionalLight.castShadow= true;
    scene.add( directionalLight );

    // Add the ball.
    var ballTexture = loader.load('./img/ball.jpg');
    ballTexture.wrapS = ballTexture.wrapT = THREE.RepeatWrapping;
    ballTexture.repeat.set(1,1);

    let g = new THREE.SphereGeometry(1, 20, 20);
    let m = new THREE.MeshPhongMaterial({map:ballTexture});
    ballMesh = new THREE.Mesh(g, m);

    player = new THREE.Object3D();
    // player.position.set(0, 0, 4);
    player.add( camera );
    player.add(ballMesh);
    scene.add(player);

    var planeTexture = loader.load('./img/lab-floor.jpg');
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(20,20);
    m = new THREE.MeshPhongMaterial({map:planeTexture});
    g = new THREE.PlaneGeometry(mazeDimension*20, mazeDimension*20, mazeDimension, mazeDimension);
    let planeMesh = new THREE.Mesh(g, m);
    scene.add(planeMesh);


    // Add the maze
    //overall maze object
    mazeMesh = new THREE.Object3D();
    //texture wrapping
    var mazeTexture = loader.load('./img/brick.jpg');
    mazeTexture.wrapS = mazeTexture.wrapT = THREE.RepeatWrapping;

    var mazeTexture2 = loader.load('./img/brick.jpg');
    mazeTexture2.wrapS = mazeTexture2.wrapT = THREE.RepeatWrapping;

    var checkersTexture = loader.load('./img/checker.gif');
    checkersTexture.wrapS = checkersTexture.wrapT = THREE.RepeatWrapping;
    checkersTexture.repeat.set(1, 2);

    mazeTexture.repeat.set(2, 4);
    mazeTexture2.repeat.set(12, 2);

    m = new THREE.MeshPhongMaterial({map:mazeTexture});
    g = new THREE.BoxGeometry(8,20,4);
    let obj1Mesh = new THREE.Mesh(g,m);
    mazeMesh.add(obj1Mesh);

    g = new THREE.BoxGeometry(20,8,4);
    m = new THREE.MeshPhongMaterial({map:mazeTexture2});
    let obj2Mesh = new THREE.Mesh(g,m);
    obj2Mesh.position.set(6, 14, 0);
    mazeMesh.add(obj2Mesh);
    scene.add(mazeMesh);

    g = new THREE.BoxGeometry(8,36,4);
    m = new THREE.MeshPhongMaterial({map:mazeTexture});
    let obj3Mesh = new THREE.Mesh(g,m);
    obj3Mesh.position.set(20, 0, 0);
    mazeMesh.add(obj3Mesh);
    scene.add(mazeMesh);

    g = new THREE.BoxGeometry(36,8,4);
    m = new THREE.MeshPhongMaterial({map:mazeTexture2});
    let obj4Mesh = new THREE.Mesh(g,m);
    obj4Mesh.position.set(6, -22, 0);
    mazeMesh.add(obj4Mesh);
    scene.add(mazeMesh);

    g = new THREE.BoxGeometry(4,10,4);
    m = new THREE.MeshPhongMaterial({map:checkersTexture});
    let obj5Mesh = new THREE.Mesh(g,m);
    obj5Mesh.position.set(-10, -13, 0);
    mazeMesh.add(obj5Mesh);
    scene.add(mazeMesh);
  }

  function updatePhysics() {
    // Step the physics world
    world.step(timeStep);
    // body.velocity.set(keyAxis[0]*10,keyAxis[1]*10 ,keyActions[0]);
    // planeMesh.rotation.x = 1;
    if(control === "platform") {
      if(keyAxis[0] !== 0 && maze.quaternion.y < 0.2 && maze.quaternion.y > -0.2 ) {
        maze.quaternion.y += keyAxis[0]/500;
      }else {
        if(maze.quaternion.y > -0.005 && maze.quaternion.y < 0.005) {
          maze.quaternion.y = 0;
        }else if(maze.quaternion.y < 0){
          maze.quaternion.y += .005;
        }else if(maze.quaternion.y > 0) {
          maze.quaternion.y -= .005;
        }
      }
      if(keyAxis[1] !== 0 && maze.quaternion.x < 0.2 && maze.quaternion.x > -0.2 ) {
        maze.quaternion.x -= keyAxis[1]/500;
      }else {
        if(maze.quaternion.x >= -0.005 && maze.quaternion.x <= 0.005) {
          maze.quaternion.x = 0;
        }else if(maze.quaternion.x < 0){
          maze.quaternion.x += .005;
        }else if(maze.quaternion.x > 0) {
          maze.quaternion.x -= .005;
        }
      }
    } else {
      if(camAngle !== 3) {
        body.velocity.x += keyAxis[0]/5;
        body.velocity.y += keyAxis[1]/5;
      }else {
        if(Math.abs(lookDir) > 12.56) {
          lookDir = 0;
        }
        camera.rotation.y -= keyAxis[0]/10;
        lookDir -= keyAxis[0]/5;
        const dir = Math.abs(lookDir/3.14);
        // let dirup = dir > 1 && dir < 3 ? -(1+dir)/2 : (1+dir)/2;
        // let dirright = dir > 2 ? -dir/2 : dir/2;
        // console.log(dirup);
        // console.log(dirright);
        if(dir >= 3.5 || dir < 0.5){
          body.velocity.y += ((keyAxis[1]/5));
        }else if(dir >= 0.5 && dir < 1.5) {
          body.velocity.x += ((keyAxis[1]/5));
        }else if(dir >= 1.5 && dir < 2.5) {
          body.velocity.y -= ((keyAxis[1]/5));
        }else if(dir >= 2.5 && dir < 3.5) {
          body.velocity.x -= ((keyAxis[1]/5));
        }


        // body.velocity.y += ((keyAxis[1]/5) * dirup);
        // body.velocity.x += ((keyAxis[1]/5) * dirright);
      }

    }


    keyAxis = [0,0];
    keyActions = [0];
    // Copy coordinates from Cannon.js to Three.js
    player.position.copy(body.position);
    ballMesh.quaternion.copy(body.quaternion);

    mazeMesh.position.copy(maze.position);
    mazeMesh.quaternion.copy(maze.quaternion);

    // planeMesh.position.copy(groundBody.position);
    // planeMesh.quaternion.copy(groundBody.quaternion);

  }

  function updateTimer() {
    //timer counting up from zero
    timer = performance.now()/10 - startTime;

    if(timer < 3000) {
      //timebox counting down from start time ie. 30.00.
      timebox.innerHTML = Math.round((Math.ceil(3000 - timer)/100) * 100)/100;
    }
  }

  function gameOver(why) {
    if(!!document.getElementById('gameover')) {
      return;
    }
    let gameover = document.createElement('div');
    gameover.setAttribute("id", "gameover");
    gameover.innerHTML = why;
    if(why === "winner"){
      gameover.style.width = 300 + "px";
      gameover.style.left = window.innerWidth/2 - 320;
    }else {
      gameover.style.width = 600 + "px";
      gameover.style.left = window.innerWidth/2 - 260;
    }
    gameover.style.top = window.innerHeight/2 - 100;
    didEnd = true;
    document.body.appendChild(gameover);

    askRestart();
  }

  function winner() {
    if(!!document.getElementById('gameover')) {
      return;
    }
    didEnd = true;
    let win = document.createElement('div');
    win.setAttribute("id", "gameover");
    win.innerHTML = "Winner";
    win.style.left = window.innerWidth/2 - 70;
    win.style.top = window.innerHeight/2 - 100;
    document.body.appendChild(win);
    askRestart();
    //Append Best Timebox
    const currTime = document.getElementById('timebox').innerHTML;
    console.log(currTime);
    bestTime = bestTime < currTime ? currTime : bestTime;
    console.log(bestTime);
    document.getElementById('bestTime').innerHTML = "Best Time: " + bestTime;
  }

  function askRestart() {
    let reset = document.createElement('div');
    reset.setAttribute("class", "question");
    reset.innerHTML = "Replay?";
    reset.style.left = window.innerWidth/2 - 200;
    reset.style.top = window.innerHeight/2;
    reset.onclick = function() {
      resetGame(control === "ball" ? "ball" : "platform");
    };
    document.body.appendChild(reset);

    if(control === "ball") {
      let harder = document.createElement('div');
      harder.setAttribute("class", "question");
      harder.innerHTML = "Harder?";
      harder.style.left = window.innerWidth/2 + 50;
      harder.style.top = window.innerHeight/2;
      harder.onclick = function() {
        resetGame("platform");
      };
      document.body.appendChild(harder);
    }

    if(control === "platform") {
      let easier = document.createElement('div');
      easier.setAttribute("class", "question");
      easier.innerHTML = "Easier?";
      easier.style.left = window.innerWidth/2 + 50;
      easier.style.top = window.innerHeight/2;
      easier.onclick = function() {
        resetGame("ball");
      };
      document.body.appendChild(easier);
    }

    let git = document.createElement('i');
    git.setAttribute("class", "question fa fa-github fa-5x");
    git.style.left = window.innerWidth/2 - 70;
    git.style.top = window.innerHeight/2 + 100;
    git.onclick = function() {
      window.open ('https://www.github.com/mikqmas','_self',false);
    };
    document.body.appendChild(git);

    let linked = document.createElement('i');
    linked.setAttribute("class", "question fa fa-linkedin fa-5x");
    linked.style.left = window.innerWidth/2 + 50;
    linked.style.top = window.innerHeight/2 + 100;
    linked.onclick = function() {
      window.open ('https://www.linkedin.com/in/samqkim','_self',false);
    };
    document.body.appendChild(linked);
  }

  function onMoveKey(axis) {
    keyAxis = axis.slice(0);
  }

  function changeAngle() {
    if(camAngle === 3) {
      camAngle = 0;
      lookDir = 0;
    }else {
      camAngle += 1;
    }

    cameraPosition = CAMERA_ANGLES[camAngle][0];
    camQuat = CAMERA_ANGLES[camAngle][1];

    camera.rotation.y = 0;

    camera.position.set(...cameraPosition);

    camera.quaternion.x = camQuat[0];
    camera.quaternion.y = camQuat[1];
    camera.quaternion.z = camQuat[2];
  }

  function onWindowResize() {
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function resetGame(arr) {
    didEnd = false;
    startTime = performance.now()/10;
    control = arr;
    body.velocity.set(0,0,0);
    body.angularVelocity.set(0,0,0);
    body.position.set(0,-5,14);
    document.body.removeChild(document.getElementById('gameover'));
    const question = document.getElementsByClassName('question');
    document.body.removeChild(question[0]);
    document.body.removeChild(question[0]);
    document.body.removeChild(question[0]);
    document.body.removeChild(question[0]);
  }

  function gameLoop(){
    if(didEnd === false) {
      updateTimer();
    }
    updatePhysics();

    if(timer > 3000) {
      gameOver("Time Expired");
    }else if(player.position.z < 1 ) {
      gameOver("Out of Bounds");
    }else if(player.position.z > 12.8 && player.position.z <= 13
          && player.position.x <= -8 && player.position.x >= -12
          && player.position.y >= -18 && player.position.y <= -8 ){
          winner();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
  }

  document.addEventListener("DOMContentLoaded", () => {
    //Add window resize listener
    window.addEventListener( 'resize', onWindowResize, false );

    timebox = document.createElement('div');
    timebox.setAttribute("id", "timebox");
    timebox.style.left = window.innerWidth/2 - 10;
    document.body.appendChild(timebox);

    // Create the renderer.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    initCannon();
    createRender();

    gameLoop();

    const start = document.getElementById('start');
    start.style.height = window.innerHeight;
    const startButton = document.getElementById('startButton');
    startButton.onclick = function() {
      document.body.removeChild(start);

      // Bind keyboard and resize events.
      KeyboardJS.bind.axis('left', 'right', 'down', 'up', onMoveKey);
      KeyboardJS.bind.axis('h', 'l', 'j', 'k', onMoveKey);
      KeyboardJS.bind.key('spacebar', function() {
          keyActions[0] = 10;
          return false;
      });

      didEnd = false;
      // Start the game loop.
      startTime = performance.now()/10;
    };
  });
