/*
	MVP version of the final project
*/
	// global varibales
	var scene, renderer;
	var camera, avatarCam, edgeCam;
  var track, wall1, wall2;

	var car;

	var endScene, endCamera, endText;
	var loseScene, loseText;
	var startScene;

	var fastestTime = Number.MAX_SAFE_INTEGER;

	var controls =
	    {fwd:false, bwd:false, left:false, right:false,
			speed:10, fly:false, reset:false,
		    camera:camera}

	var gameState = {time:0, lap:1, scene:'GameStart', camera:'none' }

	// Here is the main game control
	init(); //
	initControls();
	animate();

	// TODO
	function createEndScene(){

	}

	// TODO
	function createStartScene(){

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

		// TODO: create main camera

		// TODO: create backgroud

		// TODO: create car

		// TODO: create wall (track)
    track = createGround('ground.png');
    scene.add(track);
    wall1 = createWall(0x663300,6,50,180);
    scene.add(wall1);
    wall1.position.set(-22,0,0);
    wall2 = createWall(0x663300,6,50,180);
    scene.add(wall2);
    wall2.position.set(22,0,0);
	}

	function randN(n){
		return Math.random()*n;
	}

	function playGameMusic(){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.05 );
			sound.play();
		});
	}

	function soundEffect(file){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/'+file, function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});
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
  		var geometry = new THREE.PlaneGeometry( 50, 20, 180 );
  		var texture = new THREE.TextureLoader().load( '../images/'+image );
  		texture.wrapS = THREE.RepeatWrapping;
  		texture.wrapT = THREE.RepeatWrapping;
  		texture.repeat.set( 15, 15 );
  		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
  		var pmaterial = new Physijs.createMaterial(material,0.9,0.05);
  		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

  		mesh.receiveShadow = true;

  		//mesh.rotateX(Math.PI/2);
  		return mesh;

  	}

    function createWall(color,w,h,d){
      var geometry = new THREE.BoxGeometry( w, h, d);
      var material = new THREE.MeshLambertMaterial( { color: color} );
      mesh = new Physijs.BoxMesh( geometry, material, 0 );
      mesh.castShadow = true;
      return mesh;
    }



	function initControls(){
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

		if(gameState.scene == 'GameStart' && event.key =='p'){
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

		if (controls.fwd) {
			car.setLinearVelocity(forward.multiplyScalar(controls.speed));
		} else if (controls.bwd) {
			car.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		} else {
			var velocity = car.getLinearVelocity();
			car.x=velocity.z=0;
			car.setLinearVelocity(velocity); //stop the xz motion
		}
    	if (controls.reset){
      		car.__dirtyPosition = true;
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
