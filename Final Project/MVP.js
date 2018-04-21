/*
	MVP version of the final project
*/
	// global varibales
	var scene, renderer;
	var camera, carCamera;
	var wall1, wall2;
	var clock;

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

	var gameState = {time:0, lap:1, scene:'GameStart', camera: 'none' }

	// Here is the main game control
	init();
	initControls();
	animate();

	// TODO
	function createEndScene(){
		endScene = initScene();
		endText = createSkyBox('end.png',10);
		//endText.rotateX(Math.PI);
		endScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		endScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);
	}

	// TODO
	function createStartScene(){
		startScene = initScene();
		startText = createSkyBox('start.png',10);
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
		// TODO: setup lighting
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		scene.add(light1);
		var light0 = new THREE.AmbientLight( 0xffffff,0.25);
		scene.add(light0);

		// TODO: create main camera
		camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.set(0,50,0);
		camera.lookAt(0,0,0);
		gameState.camera = camera;

		// TODO: create backgroud
		var ground = createGround('ground.png');
		scene.add(ground);
		var skybox = createSkyBox('sky.jpg', 1);
		scene.add(skybox);

		carCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
		carCam.translateY(-4);
		carCam.translateZ(3);
		gameState.camera = carCam;

		// TODO: create car
		createCar();

		// TODO: create wall (track)
		createTrack();

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

    function createGround(image){
  		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
		var texture = new THREE.TextureLoader().load( 'images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 15, 15 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.05);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );
		mesh.receiveShadow = true;
		mesh.rotateX(Math.PI/2);
		return mesh
  	}

	function createTrack(){
		var geometry1 = new THREE.TorusGeometry( 30, 2, 40, 40);
		var material = new THREE.MeshLambertMaterial( { color: 0x4c0099} );
		var pmaterial = new Physijs.createMaterial(material,0, 0);
    	var wall1 = new Physijs.ConcaveMesh( geometry1, pmaterial, 0);
		wall1.setDamping(0.1,0.1);
		wall1.castShadow = true;
		wall1.rotateX(Math.PI / 2);

		var geometry2 = new THREE.TorusGeometry( 50, 2, 40, 40);
		var wall2 = new Physijs.ConcaveMesh( geometry2, pmaterial, 0);
		wall1.__dirtyPosition = true;
		wall2.__dirtyPosition = true;
		wall2.rotateX(Math.PI / 2);
		scene.add(wall1);
		scene.add(wall2);
	}

	function createCar(){
	// 	var loader = new THREE.JSONLoader();
	// 	loader.load("Car.json",
	// 		function (geometry) {
	// 			var material = new THREE.MeshLambertMaterial({color: 0xffff00});
	// 			var pmaterial = new Physijs.createMaterial(material, 0.9, 0.95);
	// 			car = new Physijs.BoxMesh(geometry, pmaterial);
	// 			car.position.set(20,0,20);
	// 			car.translateY(20);
	// 			car.castShadow = true;
	// 			car.setDamping(1.0, 1.0);
	// 			carCamera.position.set(20,0,20);
	// 			carCamera.lookAt(0,0,0);
	// 			car.addEventListener('collision', function(other_object){
	// 				if (other_object == wall1 || other_object== wall2c){
	// 					console.log('hit wall');
	// 				}
	// 			})
	// 			scene.add(car);
	// 			car.add(carCamera);
	// 		},
	// 	function(xhr){console.log(xhr.loaded / xhr.total*100)+'% loaded'},
	// 	function(err){console.log("error in loading:" + err)}
	//   );

		var geometry = new THREE.BoxGeometry( 5, 5, 5);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
  		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
  		car = new Physijs.BoxMesh( geometry, pmaterial );
  		car.position.set(25,2.5,25);
  		car.setDamping(0.1,0.1);
			carCam.position.set(0,4,0);
			carCam.lookAt(0,4,10);
  		car.castShadow = true;
  		scene.add(car);
			car.add(carCam);
	}

    function createWall(color,w,h,d){
    	var geometry = new THREE.BoxGeometry( w, h, d);
    	var material = new THREE.MeshLambertMaterial( { color: color} );
    	mesh = new Physijs.BoxMesh( geometry, material, 0 );
    	mesh.castShadow = true;
    	return mesh;
    }

	function createSkyBox(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.SphereGeometry( 80, 80, 80 );
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
      case "h": controls.reset = true; break;

			case "1": gameState.camera = camera; break;
			case "2": gameState.camera = carCam; break;

			// switch cameras

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
		}
	}

	function degInRad(deg) {
    	return deg * Math.PI / 180;
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
    		+ '</div>';
	}
