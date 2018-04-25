/*
	MVP version of the final project
*/
	// global varibales
	var scene, renderer;
	var camera, carCam,closeCam;
	var wall1, wall2;
	var minute=0;
	var second=0;
	var millisecond=0;
	var int;

	var car;
	var wall1, wall2;

	var endScene, endCamera, endText;
	var loseScene, loseText;
	var startScene;

	var fastestTime = Number.MAX_SAFE_INTEGER;

	var controls =
	    {fwd:false, bwd:false, left:false, right:false,
			speed:10, fly:false, reset:false,
		    camera:camera}

	var gameState = {time:0, lap:1, lastLap:0, scene:'GameStart', camera: 'none' }

	// Here is the main game control
	init();
	initControls();
	animate();

	//reset the timer
	function Reset(){
		window.clearInterval(int);
		millisecond=minute=second=0;
		document.getElementById('timetext').value='00:00:000';
		gameState.lap = 1;
	}

	function start(){
		int=setInterval(timer,50);
	}

	//timing
	function timer(){
		millisecond=millisecond+50;
		if(millisecond>=1000){
			millisecond=0;
			second=second+1;
		}
		if(second>=60){
			second=0;
			minute=minute+1;
		}
		document.getElementById('timetext').value=minute+':'+second+':'+millisecond;
	}

	function stop(){
		window.clearInterval(int);
	}

	function count(){
		gameState.lastLap = minute+':'+second+':'+millisecond;
		window.clearInterval(int);
		millisecond=minute=second=0;
		document.getElementById('timetext').value='00:00:000';
		int=setInterval(timer,50);
		gameState.lap+=1;
	}

	function createEndScene(){
		endScene = initScene();
		endText = createSkyBox('end.png',1);
		//endText.rotateX(Math.PI);
		endScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		endScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);
	}

	function createStartScene(){
		startScene = initScene();
		startText = createGround('start.png', 100, 1);
		startText.rotateX(Math.PI);
		startScene.add(startText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		startScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);
	}

	/**
	  To initialize the scene, we initialize each of its components
	*/
	function init(){
    	initPhysijs();
		scene = initScene();
		createEndScene();
		initRenderer();
		createMainScene();
		createStartScene();
	}

	function createMainScene(){
		// Setup lighting
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		scene.add(light1);
		var light0 = new THREE.AmbientLight( 0xffffff,0.25);
		scene.add(light0);

		// Create main camera
		camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.set(0,80,0);
		camera.lookAt(0,0,0);
		//gameState.camera = camera;

		// Create backgroud
		var ground = createGround('ground.png', 240, 20);
		scene.add(ground);
		var skybox = createSkyBox('sky.jpg', 1);
		scene.add(skybox);

		closeCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
		closeCam.translateY(-4);
		closeCam.translateZ(6);

		carCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
		carCam.translateY(-4);
		carCam.translateZ(6);
		gameState.camera = carCam;

		// Create car
		createCar();

		// Create wall (track)
		createTrack();

		// Add items
		addItems();
	}

	function randN(n){
		return Math.random()*n;
	}

	function initScene(){
    	var scene = new Physijs.Scene();
		return scene;
	}

	function initPhysijs(){
		Physijs.scripts.worker = '/js/physijs_worker.js';
		Physijs.scripts.ammo = '/js/ammo.js';
	}

	/*
		The renderer needs a size and the actual canvas we draw on
		needs to be added to the body of the webpage. We also specify
		that the renderer will be computing soft shadows
	*/
	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}

	function createPointLight(){
		var light;
		light = new THREE.PointLight( 0xffffff);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 2048;  // default
		light.shadow.mapSize.height = 2048; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}

    function createGround(image, l, k){
  		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( l, l, 160 );
		var texture = new THREE.TextureLoader().load( 'images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.5,0.01);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );
		mesh.receiveShadow = true;
		mesh.rotateX(Math.PI/2);
		return mesh
  	}

	function createTrack(){
		var geometry1 = new THREE.TorusGeometry( 12, 4, 40, 40);
		var material = new THREE.MeshLambertMaterial( { color: 0x994c00} );
		var pmaterial = new Physijs.createMaterial(material,0, 0);
		var wall1 = new Physijs.ConvexMesh( geometry1, pmaterial, 0);
		wall1.setDamping(0.1,0.1);
		wall1.castShadow = true;
		wall1.rotateX(Math.PI / 2);

		w0 = createWall(0x994c00, 120, 8, 4);
		w0.__dirtyPosition = true;
		w0.position.set(0, 0, 60);

		w1 = createWall(0x994c00, 120, 8, 4);
		w1.__dirtyPosition = true;
		w1.position.set(0, 0, -60);

		w2 = createWall(0x994c00, 120, 8, 4);
		w2.__dirtyPosition = true;
		w2.rotateY(Math.PI / 2);
		w2.position.set(60, 0, 0);

		w3 = createWall(0x994c00, 120, 8, 4);
		w3.__dirtyPosition = true;
		w3.rotateY(Math.PI / 2);
		w3.position.set(-60, 0, 0);

		wall1.__dirtyPosition = true;
		scene.add(wall1);
		scene.add(w0);
		scene.add(w1);
		scene.add(w2);
		scene.add(w3);
	}

	function createBox(){
		var geometry = new THREE.BoxGeometry(5, 5, 5);
		var material = new THREE.MeshLambertMaterial( { color: 0x994c00} );
		var mesh = new Physijs.BoxMesh(geometry, material, 0);

		return mesh;
	}

	function createBall(){
		var geometry = new THREE.SphereGeometry(2, 60, 60)
		var material = new THREE.MeshLambertMaterial( { color: 0x994c00} );
		var mesh = new Physijs.SphereMesh(geometry, material, 0);

		return mesh;
	}

	function addItems(){
		num = 5;
		while(num > 0){
			mesh = createBox();
			addItem(mesh);
			mesh.addEventListener( 'collision',
				function(other_object) {
					if (other_object==car){
						controls.speed-=1;
					}
				}
			)
			num -= 1;
		}
		num = 5;
		while(num > 0){
			mesh = createBall();
			addItem(mesh);
			mesh.addEventListener( 'collision',
				function(other_object) {
					if (other_object==car){
						controls.speed+=0.7;
						car.setAngularVelocity(new THREE.Vector3(0,0,controls.speed*0.05))

					}
				}
			)
			num -= 1;
		}
	}

	function addItem(mesh){
		var xPoistive = false;
		if (randN(1) >= 0.5) { xPoistive = true; }
		var zPositve = false;
		if (randN(1) >= 0.5) { zPoistive = true; }
		x = randN(20) + 20;
		z = randN(20) + 20;
		if (!xPoistive) { x = -x; }
		if (!zPositve) { z = -z; }
		mesh.position.set(x, 0, z);
		scene.add(mesh);

	}

	function createCar(){
	 		var loader = new THREE.JSONLoader();
	 		loader.load("car11.json",
	 			function (geometry,materials) {
	 				var material = new THREE.MeshLambertMaterial({color: 0xff8000});
	 				var pmaterial = new Physijs.createMaterial(material, 0.9, 0.95);
					car = new Physijs.BoxMesh(geometry, pmaterial);
					car.position.set(0,10,-25);
	 				car.translateY(20);
	 				car.castShadow = true;
	 				car.setDamping(1.0, 1.0);

					closeCam.position.set(15,2,0);
					closeCam.lookAt(0,4,10)

					carCam.position.set(0,4,0);
					carCam.lookAt(0,4,10)
					/*
	 				car.addEventListener('collision', function(other_object){
						if (other_object == wall1 || other_object== wall2c){
							console.log('hit wall');
	 					}
	 				})
					*/
	 				scene.add(car);
	 				car.add(carCam);
					car.add(closeCam);
	 			},
	 		function(xhr){console.log(xhr.loaded / xhr.total*100)+'% loaded'},
	 		function(err){console.log("error in loading:" + err)}
	   	);
	}

    function createWall(color,w,h,d){
    	var geometry = new THREE.BoxGeometry( w, h, d);
    	var material = new THREE.MeshLambertMaterial( { color: color} );
    	mesh = new Physijs.BoxMesh( geometry, material, 0 );
    	mesh.castShadow = true;
    	return mesh;
			mesh.addEventListener( 'collision',
				function(other_object) {
					if (other_object==car){
						car.position.set(0,10,-25);
						car.__dirtyPosition=true;
						car.setAngularVelocity(new THREE.Vector3(controls.speed*0.1,controls.speed*0.1,controls.speed*0.1))
					}
				}
			)
    }

	function createSkyBox(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.SphereGeometry( 180, 180, 180 );
		var texture = new THREE.TextureLoader().load( 'images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var mesh = new THREE.Mesh( geometry, material, 0 );
		mesh.receiveShadow = false;
		return mesh
	}

	function initControls(){
		//create a clock for the time-based animation ...
		clock = new THREE.Clock();
		clock.start();

		window.addEventListener( 'keydown', keydown);
		window.addEventListener( 'keyup',   keyup );
  }

	function keydown(event){
		console.log("Keydown: '"+event.key+"'");

		// first we handle the "play again" key in the "youwon" scene
		if (gameState.scene == 'youwon' && event.key=='r') {
			gameState.scene = 'GameStart';
			gameState.score = 0;
			gameState.health = 10;
			return;
		}

		// we handle the "play again" key in the "youlose" scene
		if (gameState.scene == 'youlose' && event.key=='r') {
			gameState.scene = 'GameStart';
			gameState.score = 0;
			gameState.health = 10;
			return;
		}

		if (gameState.scene == 'GameStart' && event.key =='p'){
			gameState.scene = 'main';
			gameState.score = 0;
			gameState.health = 10;
			return;
		}

		// this is the regular scene
		switch (event.key){
			// change the way the car is moving
			case "w": controls.fwd = true;  break;
			case "s": controls.bwd = true; break;
			case "a": controls.left = true; break;
			case "d": controls.right = true; break;
			case "m": controls.speed = 30; break;
      case "h": controls.reset = true;
								controls.speed = 10;break;
			case "j": car.translateY(10);
								car.__dirtyPosition=true;
								;break;

			case "1": gameState.camera = camera; break;
			case "2": gameState.camera = closeCam; break;
			case "3": gameState.camera = carCam; break;

			// switch cameras

			case "ArrowLeft": carCam.translateY(1);closeCam.translateY(1);break;
			case "ArrowRight": carCam.translateY(-1);closeCam.translateY(-1);break;
			case "ArrowUp": carCam.translateZ(-1);closeCam.translateZ(-1);break;
			case "ArrowDown": carCam.translateZ(1);closeCam.translateZ(1);break;
			case "q": carCam.left = true;closeCam.left=true;break;
			case "e": carCam.right = true;closeCam.left=true;break;

		}
	}

	function keyup(event){
		switch (event.key){
			case "w": controls.fwd   = false;  break;
			case "s": controls.bwd   = false; break;
			case "a": controls.left  = false; break;
			case "d": controls.right = false; break;
			case "m": controls.speed = 10; break;
    	case "h": controls.reset = false; break;
			case "q": carCam.left = false; closeCam.left=false;break;
			case "e": carCam.right = false;closeCam.right=false;break;
			case "j": car.translateY(-10); break;
		}
	}

	function degInRad(deg) {
    	return deg * Math.PI / 180;
	}

	function updateCarCam(){
		if(carCam.left){
			carCam.rotateOnAxis((new THREE.Vector3(0, 1, 0)).normalize(), degInRad(0.5));
		}
		if(carCam.right){
			carCam.rotateOnAxis((new THREE.Vector3(0, 1, 0)).normalize(), degInRad(-0.5));
		}
	}

	function updateCloseCam(){
		if(closeCam.left){
			closeCam.rotateOnAxis((new THREE.Vector3(0, 1, 0)).normalize(), degInRad(0.5));
		}
		if(closeCam.right){
			closeCam.rotateOnAxis((new THREE.Vector3(0, 1, 0)).normalize(), degInRad(-0.5));
		}
	}

	function updateCar() {
		var forward = car.getWorldDirection();

		if (controls.fwd){
			car.setLinearVelocity(forward.multiplyScalar(controls.speed));
		} else if (controls.bwd){
			car.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		} else {
			var velocity = car.getLinearVelocity();
			velocity.x=velocity.z=0;
			car.setLinearVelocity(velocity); //stop the xz motion
		}

		if (controls.left){
			car.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
		} else if (controls.right){
			car.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
		}

		if (controls.reset){
			car.__dirtyPosition = true;
			car.position.set(25,2.5,25);
			car.__dirtyRotation = true;
			car.rotation.set(0, 0, 0);
		}

	}

	function distanceVector(){
		var dx = avatar.position.x - npc.position.x;
		var dy = avatar.position.y - npc.position.y;
		var dz = avatar.position.z - npc.position.z;
		return Math.sqrt( dx * dx + dy * dy + dz * dz );
	}

	function animate() {
		requestAnimationFrame( animate );
		switch(gameState.scene) {
			case "youlose":
				renderer.render( loseScene, endCamera);
				break;
			case "youwon":
				renderer.render( endScene, endCamera );
				break;
			case "GameStart":
				renderer.render(startScene,endCamera);
				break;
			case "main":
			  updateCloseCam();
			  updateCarCam();
			  updateCar();
	    	scene.simulate();
				if (gameState.camera!= 'none'){
					renderer.render( scene, gameState.camera );
				}
				break;
			default:
				console.log("don't know the scene "+gameState.scene);
		}

		//draw heads up display ..
		var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Time: '
			+ gameState.time
			+ ' Lap: ' + gameState.lap
			+ 'Last Lap: '+ gameState.lastLap
    		+ '</div>';
	}
