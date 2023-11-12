const centipedeLegsR = [];
const centipedeLegsL = [];
var scene;
const centipede = [];
var centipede_directionX =[1,1,1,1,1,1]; // 1 er til hægri, -1 til vinstri
var centipede_directionZ =[1,1,1,1,1,1]; // 1 er niður, -1 er upp
var centipede_rowPlace = [7.5, 7.5, 7.5, 7.5, 7.5, 7.5];
var centipede_row = [6.5, 6.5, 6.5, 6.5, 6.5, 6.5];
var mushrooms = [];
var mushrooms_dying = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const gridXZ = [7,6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6,-7]
var current_row = [0,0,0,0,0,0];
var rows_visited = [1,0,0,0,0,0,0,0,0,0,0,0,0,0];
var mushroom_done = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0]
]

var elfPosition = [0.0, -7.5]; 
var shotPosition = [0.0, -7.0]; 

var shooting = 0;
var shots = [];

var centipede_dead = [0,0,0,0,0,0];

var points = 0;

var camera1;
var camera2;

var objectCamera;
var currentCamera;

window.onload = function init(){
	const canvas = document.querySelector('#c'); // strigi
	const points_location = document.querySelector('#points'); // points
	const game_location = document.querySelector('#game'); // points
	scene = new THREE.Scene(); // sviðsnet

	camera1 = new THREE.PerspectiveCamera( 45, canvas.clientWidth/canvas.clientHeight, 0.1, 1000 ); // Skilgreina myndavél og staðsetja hana
	camera1.position.set(0,15,-22);
	camera1.lookAt(0,0,0)

	camera2 = new THREE.PerspectiveCamera( 45, canvas.clientWidth/canvas.clientHeight, 0.1, 1000 ); // Skilgreina myndavél og staðsetja hana
	camera2.position.set(0,15,-22);


	objectCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);
	objectCamera.position.set(0, 2, -7);
	objectCamera.lookAt(0,0,0)
	scene.add(objectCamera);

	currentCamera = camera1;

	const controls = new THREE.OrbitControls( camera2, canvas ); // Músastýringar
	const renderer = new THREE.WebGLRenderer({canvas, antialias:true}); //birtingaraðferð

	board();
	//grid();
	const mushroom = Mushroom();
	const centipedeHead = CentipedeHead();
	const centipedeBody = CentipedeBody();
	const elf = Elf();

	centipedeHead.translateZ(0.5);
	centipedeHead.translateZ(gridXZ[0]);
	centipedeHead.translateX(gridXZ[5]);
	centipedeHead.rotateY(Math.PI / 2);
	centipede.push(centipedeHead);
	scene.add(centipedeHead);
	
	for(i= 0; i< 5; i++){
		const centipedeBody = CentipedeBody();
		centipedeBody.translateZ(0.5);
		centipedeBody.translateZ(gridXZ[0]);
		centipedeBody.translateX(gridXZ[4-i]);
		centipedeBody.rotateY(Math.PI / 2);
		centipede.push(centipedeBody);
		scene.add(centipedeBody)
	}
	

	elf.rotateY(Math.PI)
	elf.translateZ(7.5);
	scene.add(elf);

	for(i=0; i<14; i++){
		const randomInt = Math.floor(Math.random() * 15);
		const mushroom = Mushroom();
		mushroom.translateZ(0.5);
		mushroom.translateX(gridXZ[randomInt]);
		mushroom.translateZ(gridXZ[i+1]);
		mushrooms.push(mushroom);
		scene.add(mushroom)
	}

	window.addEventListener("keydown", moveElf);
	window.addEventListener("keydown", makeshot);
	window.addEventListener("keydown", switchCamera);


	// Skilgreina ljósgjafa og bæta honum í sviðsnetið
	const light = new THREE.DirectionalLight(0xFFFFFF, 1);
	light.position.set(3, 3, 3);
	scene.add(light);
	light.target.position.set(0, 0, 0);
	scene.add(light);
	scene.add(light.target);

	const light2 = new THREE.DirectionalLight(0xFFFFFF, 1);
	light.position.set(15, 3, 3);
	scene.add(light2);

	const light3 = new THREE.DirectionalLight(0xFFFFFF, 1);
	light.position.set(15, 15, 3);
	scene.add(light3);

	const light4 = new THREE.DirectionalLight(0xFFFFFF, 1);
	light.position.set(3, 15, 3);
	scene.add(light4);

	// Hreyfifall
	const animate = function (time) {
		time *= 0.003;
		elf.position.x = elfPosition[0];
		elf.position.z = elfPosition[1];

		if(shooting == 1){
			shooting = 0;
			const shot = Shot();
			shot.position.x = shotPosition[0];
			shot.position.z = shotPosition[1];
			scene.add(shot);
			shots.push(shot);
		}

		for(i=0; i<shots.length; i++){
			if(shots[i] !== null){
				shots[i].translateY(0.3)


				for(j = 0; j < mushrooms.length; j++){
					if(shots[i].position.x > mushrooms[j].position.x -0.5 && shots[i].position.x < mushrooms[j].position.x + 0.5 && 
						shots[i].position.z > mushrooms[j].position.z - 0.5 && shots[i].position.z < mushrooms[j].position.z + 0.5 && mushrooms_dying[j] != 4){

							const scalingSteps = [0.75, 0.5, 0.25, 0]; // Adjust the steps as needed
							scene.remove(shots[i]);
							shots[i] = null;

							if(mushrooms_dying[j] < 3) {
									const scaleValue = scalingSteps[mushrooms_dying[j]];
									mushrooms[j].scale.set(scaleValue, scaleValue, scaleValue);
									mushrooms_dying[j]++;
							} else {
								scene.remove(mushrooms[j]);
								mushrooms_dying[j] = 4;
								points += 1;
								points_location.innerText = points;
							}
							break;
/*
							if (mushrooms_dying[j] == 0){
								mushrooms[j].scale.set(0.75, 0.75, 0.75);
								mushrooms_dying[j] = 1
							}
							else if(mushrooms_dying[j] == 1){
								mushrooms[j].scale.set(0.5, 0.5, 0.5);
								mushrooms_dying[j] = 2
							}
							else if(mushrooms_dying[j] == 2){
								mushrooms[j].scale.set(0.25, 0.25, 0.25);
								mushrooms_dying[j] = 3
							}
							else{
								scene.remove(mushrooms[j]);
								mushrooms_dying[j] = 4;
							}*/
					}
				}

				for(j = 0; j < centipede.length; j++){
					if(shots[i] != null && shots[i].position.x > centipede[j].position.x -0.5 && shots[i].position.x < centipede[j].position.x + 0.5 && 
									shots[i].position.z > centipede[j].position.z - 0.5 && shots[i].position.z < centipede[j].position.z + 0.5 && centipede_dead[j] != 1){
						centipede_dead[j] = 1;
						scene.remove(shots[i]);
						scene.remove(centipede[j]);
						centipede_dead[j] = 1;
						if(j == 0){
							points += 100;
						} else{
							points += 10;
						}
						points_location.innerText = points


					const mushroom = Mushroom();
					mushroom.position.x = centipede[j].position.x;
					mushroom.position.z = centipede[j].position.z;
					scene.add(mushroom);
					mushrooms.push(mushroom);
					mushrooms_dying.push(0);
					/*
					for (let i = 0; i < mushroom_done.length; i++) {
						mushroom_done[i].push(0);
					}
					if(j != 0 && centipede[j-1].parent === scene){
						const centipedeHead = CentipedeHead();
						scene.add(centipedeHead);
						centipede[j-1] = centipedeHead;
					}
					*/

					if(centipede_dead.every(value => value === 1)){
							centipede_dead= [0,0,0,0,0,0];
							scene.add(centipede[0]);
							scene.add(centipede[1]);
							scene.add(centipede[2]);
							scene.add(centipede[3]);
							scene.add(centipede[4]);
							scene.add(centipede[5]);/*
							centipede[0].position.set(5, 0, 7);
							centipede[1].position.set(4, 0, 7);
							centipede[2].position.set(3, 0, 7);
							centipede[3].position.set(2, 0, 7);
							centipede[4].position.set(1, 0, 7);
							centipede[5].position.set(0, 0, 7);*/
					}
					shots[i] = null;
					break;
					}
				}
			}
		}

		for(i = 0; i < centipedeLegsR.length; i++){
			centipedeLegsR[i].rotation.x = Math.sin(time) * Math.PI / 4 ;
			centipedeLegsL[i].rotation.x = Math.sin(time) * Math.PI / 4;
		}
		for(i = 0; i < centipede.length; i++){
			centipede[i].translateZ(-0.1)

			// Go up 
			if(centipede[i].position.z <-6.5 && centipede_directionZ[i] != -1){
				centipede_directionZ[i] *= -1;
				centipede[i].rotateY(Math.PI /2);
				centipede_directionX[i] = 1;
				for (let j = 0; j < mushroom_done[1].length; j++) {
					mushroom_done[i][j] = 0;
				}
				continue;
			}

			// Go down
			if(centipede[i].position.z > 7.5 && centipede_directionZ[i] != 1){
				centipede_directionZ[i] *= -1;
				centipede[i].rotateY(-Math.PI /2);
				centipede_directionX[i] = 1;
				for (let j = 0; j < mushroom_done[1].length; j++) {
					mushroom_done[i][j] = 0;
				}
				continue;
			}


			// If it hits the sides
			if((centipede[i].position.x < -7 && centipede_directionX[i] == 1 && centipede_directionZ[i] == 1) || (centipede[i].position.x > 7 && centipede_directionX[i] == -1 && centipede_directionZ[i] == 1)){
				centipede_directionX[i] *= -1;
				centipede_rowPlace[i] -= 1;
				if(centipede_directionX[i] == -1) {centipede[i].rotateY(-Math.PI /2);}
				else{centipede[i].rotateY(Math.PI /2);}
			}

			if((centipede[i].position.x < -7 && centipede_directionX[i] == 1 && centipede_directionZ[i] == -1) || (centipede[i].position.x > 7 && centipede_directionX[i] == -1 && centipede_directionZ[i] == -1)){
				centipede_directionX[i] *= -1;
				centipede_rowPlace[i] -= 1;
				if(centipede_directionX[i] == -1) {centipede[i].rotateY(Math.PI /2);}
				else{centipede[i].rotateY(-Math.PI /2);}
			}

			// change back to the next row
			if(centipede[i].position.z < gridXZ[current_row[i]]-0.5 && centipede_directionZ[i] == 1){
				
				centipede_row[i] -= 1;
				if(centipede_directionX[i] == -1) {centipede[i].rotateY(-Math.PI /2); }
				else{centipede[i].rotateY(Math.PI /2); }
				current_row[i] += 1;
			}

			if(centipede[i].position.z > gridXZ[current_row[i]]+0.5 && centipede_directionZ[i] == -1){
				centipede_row[i] += 1;
				if(centipede_directionX[i] == -1) {centipede[i].rotateY(Math.PI /2); }
				else{centipede[i].rotateY(-Math.PI /2); }
				current_row[i] -= 1;
			}

			// if it hits a mushroom
			if(current_row[i] != 0 && centipede_directionZ[i] == 1){
				if((centipede[i].position.x > mushrooms[current_row[i]-1].position.x - 1.0 && centipede_directionX[i] == -1 && mushroom_done[i][current_row[i]-1] != 1) || 
					 (centipede[i].position.x < mushrooms[current_row[i]-1].position.x + 1.0 && centipede_directionX[i] == 1 && mushroom_done[i][current_row[i]-1] != 1)){
					mushroom_done[i][current_row[i]-1] = 1;
					centipede_directionX[i] *= -1;
					centipede_rowPlace[i] -= 1;
					if(centipede_directionX[i] == -1) {centipede[i].rotateY(-Math.PI /2);}
					else{centipede[i].rotateY(Math.PI /2);}
				}
			}

			if(current_row[i] != 0 && centipede_directionZ[i] == -1){
				if((centipede[i].position.x > mushrooms[current_row[i]].position.x - 1.0 && centipede_directionX[i] == -1 && mushroom_done[i][current_row[i]-1] != 1) || 
					 (centipede[i].position.x < mushrooms[current_row[i]].position.x + 1.0 && centipede_directionX[i] == 1 && mushroom_done[i][current_row[i]-1] != 1)){
					mushroom_done[i][current_row[i]-1] = 1;
					centipede_directionX[i] *= -1;
					centipede_rowPlace[i] -= 1;
					if(centipede_directionX[i] == -1) {centipede[i].rotateY(Math.PI /2);}
					else{centipede[i].rotateY(-Math.PI /2);}
				}
			}




			//collision of elf and centipede
			if(elf.position.x + 0.3 > centipede[i].position.x -0.3 && elf.position.x -0.3 < centipede[i].position.x + 0.3 && 
				elf.position.z +0.3 > centipede[i].position.z - 0.3 && elf.position.z -0.3 < centipede[i].position.z + 0.3){
					game_location.innerText = "Game over";
					return;
			}



		}
		requestAnimationFrame( animate );
		controls.update();
		renderer.render( scene, currentCamera );
	};

	animate();
}

/**
 * Makes the ground
 */
function board(){

	const loader = new THREE.TextureLoader();
	const texture = loader.load('grass.jpg');

	// Notum nú bara einfalda áferð án ljósgjafa og tilgreinum mynstrið
	const material = new THREE.MeshBasicMaterial({ map: texture });

	const planeMesh = new THREE.Mesh(
		new THREE.PlaneGeometry(15,16),
		new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: texture})
	)
	planeMesh.rotateX(-Math.PI /2);
	scene.add( planeMesh );
}

/**
 * Helper grid
 */
function	grid(){
	var grid = new THREE.GridHelper(16, 16)
	grid.translateX(0.5)
	scene.add(grid);
}


/**
 * Makes a mushroom
 * @returns mushroom
 */
function Mushroom(){
	const CylinderMesh = new THREE.Mesh(
		new THREE.CylinderGeometry( 0.1, 0.1, 0.6, 32 ),
		new THREE.MeshStandardMaterial({color: 0xfcfafa})
	)
	CylinderMesh.translateY(0.3);


	const ConeMesh = new THREE.Mesh(
		new THREE.ConeGeometry( 0.4, 0.2, 32 ),
		new THREE.MeshStandardMaterial({color: 0xa83832})
	)
	ConeMesh.setAttribute
	ConeMesh.translateY(0.6);

	const Mushroom = new THREE.Group();
	Mushroom.add( CylinderMesh );
	Mushroom.add( ConeMesh );

	return Mushroom;
}

function body(){
	const body = new THREE.Mesh(
		new THREE.SphereGeometry(0.5),
		new THREE.MeshStandardMaterial({color: 0x278c29})
	)
	body.translateY(0.5);

	return body;
}

/**
 * Makes the eyes for the centipede
 * @returns THREE.Group of two eyes
 */
function eyes(){
	const eyes = new THREE.Group();

	const eye1 = new THREE.Mesh(
		new THREE.SphereGeometry(0.15),
		new THREE.MeshPhongMaterial({color: 0xe61919})
	)
	eye1.translateY(0.7);
	eye1.translateZ(-0.35);
	eye1.translateX(0.15);

	const eye2 = new THREE.Mesh(
		new THREE.SphereGeometry(0.15),
		new THREE.MeshPhongMaterial({color: 0xe61919})
	)
	eye2.translateY(0.7);
	eye2.translateZ(-0.35);
	eye2.translateX(-0.15);

	eyes.add(eye1);
	eyes.add(eye2);

	return eyes;
}

/**
 * Makes legs for the centipedes
 * @returns THREE.Group of tvo legs
 */
function legs(){
	const legs = new THREE.Group();
	const UpperlegL = new THREE.Mesh(
		new THREE.CylinderGeometry( 0.05, 0.05, 0.4 ),
		new THREE.MeshStandardMaterial({color: 0xf29d13})
	)
	UpperlegL.translateY(0.5);
	UpperlegL.translateX(0.4);
	UpperlegL.rotateZ(1.4);

	const UpperlegR = new THREE.Mesh(
		new THREE.CylinderGeometry( 0.05, 0.05, 0.4 ),
		new THREE.MeshStandardMaterial({color: 0xf29d13})
	)
	UpperlegR.translateY(0.5);
	UpperlegR.translateX(-0.4);
	UpperlegR.rotateZ(-1.4);

	const LowerlegL = new THREE.Mesh(
		new THREE.CylinderGeometry( 0.05, 0.05, 0.5 ),
		new THREE.MeshStandardMaterial({color: 0xf29d13})
	)
	LowerlegL.position.set(0.58,-0.25,0);
	LowerlegL.rotateZ(0.1);

	const LowerlegR = new THREE.Mesh(
		new THREE.CylinderGeometry( 0.05, 0.05, 0.5 ),
		new THREE.MeshStandardMaterial({color: 0xf29d13})
	)
	LowerlegR.position.set(-0.58,-0.25,0);
	LowerlegR.rotateZ(-0.1);

	legs.add(UpperlegL);
	legs.add(UpperlegR);
	legs.add(LowerlegL);
	legs.add(LowerlegR);

	// To be able to move the legs
	const centipedeLegL = new THREE.Group();
	centipedeLegL.add(LowerlegL);
	scene.add(centipedeLegL);
	centipedeLegL.position.set(0.0, 0.5, 0)
	centipedeLegsL.push(centipedeLegL);

	const centipedeLegR = new THREE.Group();
	centipedeLegR.add(LowerlegR);
	scene.add(centipedeLegR);
	centipedeLegR.position.set(0.0, 0.5, 0)
	centipedeLegsR.push(centipedeLegR);

	legs.add(centipedeLegL);
	legs.add(centipedeLegR);
	
	return legs;
}

/**
 * Makes the full head body
 * @returns centipede head
 */
function CentipedeHead(){
	const bodyGroup = body();
	const eyeGroup = eyes();
	const legsGroup= legs();

	const head = new THREE.Group();
	head.add(bodyGroup);
	head.add(eyeGroup);
	head.add(legsGroup);

	//head.scale.set(0.5, 0.5, 0.5);

	return head;
}

/**
 * Makes the body of the centipede
 * @returns 
 */
function CentipedeBody(){
	const bodyGroup = body();
	const legsGroup= legs();

	const tail = new THREE.Group();
	tail.add(bodyGroup);
	tail.add(legsGroup);
	//tail.scale.set(0.5, 0.5, 0.5);

	return tail;
}


/**
 * Makes the garden elf
 * @returns the elf group
 */
function Elf(){
	const elf = new THREE.Group();
	const legR = new THREE.Mesh(
		new THREE.CylinderGeometry( 0.07, 0.07, 0.4 ),
		new THREE.MeshStandardMaterial({color: 0x1f2d99})
	)
	legR.translateY(0.2);
	legR.translateX(0.1);

	const legL = new THREE.Mesh(
		new THREE.CylinderGeometry( 0.07, 0.07, 0.4 ),
		new THREE.MeshStandardMaterial({color: 0x1f2d99})
	)
	legL.translateY(0.2);
	legL.translateX(-0.1);

	const body = new THREE.Mesh(
		new THREE.ConeGeometry( 0.3, 0.7, 32 ),
		new THREE.MeshStandardMaterial({color: 0xa2f871e})
	)
	body.translateY(0.7);

	const head = new THREE.Mesh(
		new THREE.SphereGeometry(0.2),
		new THREE.MeshStandardMaterial({color: 0xededed})
	)
	head.translateY(1.0);

	const hat = new THREE.Mesh(
		new THREE.ConeGeometry( 0.2, 0.35, 32 ),
		new THREE.MeshStandardMaterial({color: 0xde1818})
	)
	hat.translateY(1.25);

	const armL = new THREE.Mesh(
		new THREE.CylinderGeometry( 0.05, 0.05, 0.4 ),
		new THREE.MeshStandardMaterial({color: 0xa2f871e})
	)
	armL.translateY(0.6);
	armL.translateX(0.2);
	armL.rotateZ(0.8);

	const armR = new THREE.Mesh(
		new THREE.CylinderGeometry( 0.05, 0.05, 0.4 ),
		new THREE.MeshStandardMaterial({color: 0xa2f871e})
	)
	armR.rotateY(-1.6);
	armR.translateY(0.7);
	armR.translateX(-0.2);
	armR.translateZ(0.1);
	armR.rotateZ(1.6);

	elf.add(legR);
	elf.add(legL);
	elf.add(body);
	elf.add(head);
	elf.add(hat);
	elf.add(armL);
	elf.add(armR);

	return elf;
}

/**
 * Makes the shot that the elf shoots
 * @returns 
 */
function Shot(){
	const shot = new THREE.Mesh(
		new THREE.CapsuleGeometry( 0.03, 0.2 ),
		new THREE.MeshPhongMaterial({color: 0x2b2b2b})
	)
	shot.translateY(0.7);
	shot.rotateZ(1.55);
	shot.rotateX(Math.PI /2)
	shot.translateY(-7)
	return shot
}

function moveElf(event) {
	switch (event.keyCode) {
			case 65: // Left arrow
			if(elfPosition[0] < 7.0){
					elfPosition[0] += 0.4;
					shotPosition[0] += 0.4;
					objectCamera.position.x += 0.4;
			}
					break;
			case 87: // Up arrow
			if(elfPosition[1] < -5.5){
					elfPosition[1] += 0.4;
					shotPosition[1] += 0.4;
					objectCamera.position.z += 0.4;
			}
					break;
			case 68: // Right arrow
			if(elfPosition[0] > -7.0){
					elfPosition[0] -= 0.4;
					shotPosition[0] -= 0.4;
					objectCamera.position.x -= 0.4;
			}
					break;
			case 83: // Down arrow
				if(elfPosition[1] > -7.89){
					elfPosition[1] -= 0.4;
					shotPosition[1] -= 0.4;
					objectCamera.position.z -= 0.4;
				}
					break;
	}

}


function makeshot(event) {

	switch (event.keyCode) {
		case 32: 
			shooting = 1;
			break;
	}
}


function switchCamera(event) {
	switch (event.keyCode) {
			case 49: // Pressed '1'
			case 97:
					currentCamera = camera1;
					break;
			case 50: // Pressed '2'
			case 98:
					currentCamera = objectCamera;
					break;
			case 51: // Pressed '2'
			case 99:
					currentCamera = camera2;
					break;
	}
	console.log('switch');
}
