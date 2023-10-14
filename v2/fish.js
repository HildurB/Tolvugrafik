
var canvas;
var gl;

var NumVertices  = 30;
var NumBody = 21;
var NumTail = 3;
var NumSides = 6;
var NumCube = 24;

// Búkur
var A = vec4(-0.5, 0.0, 0.0, 1.0);
var B = vec4(0.2, 0.0, 0.1, 1.0);
var C = vec4(0.5, 0.0, 0.0, 1.0);
var D = vec4(0.2, 0.2, 0.0, 1.0);
var E = vec4(0.2, -0.15, 0.0, 1.0);
var F = vec4(0.2, 0.0, -0.1, 1.0);

// Sporður
var G = vec4(-0.65, 0.15, 0.0, 1.0);
var H = vec4(-0.65, -0.15, 0.0, 1.0);

// Hliðaruggar
var I = vec4(0.1, 0.0, 0.07, 1.0);
var J = vec4(0.3, 0.0, 0.07, 1.0);
var K = vec4(0.2, 0.0, 0.2, 1.0);

var L = vec4(0.1, 0.0, -0.07, 1.0);
var M = vec4(0.3, 0.0, -0.07, 1.0);
var N = vec4(0.2, 0.0, -0.2, 1.0);


var vertices_fish = [
    // líkami
    C, D, B,
    E, C, B, 
    C, F, D,
    C, E, F,
    D, A, B,
    E, A, D, 
    F, A, E,
	// sporður
    A, G, H,
  //Hliðaruggar
    I, J, K,
    L, M, N
];

var cube = [
  vec4(-2.0, -2.0, 2.0, 1.0),
  vec4(-2.0, 2.0, 2.0, 1.0),
  vec4(2.0, 2.0, 2.0, 1.0),
  vec4(2.0, -2.0, 2.0, 1.0),
  vec4(-2.0, -2.0, -2.0, 1.0),
  vec4(-2.0, 2.0, -2.0, 1.0),
  vec4(2.0, 2.0, -2.0, 1.0),
  vec4(2.0, -2.0, -2.0, 1.0)
];

var vertices_cube = [
  cube[1], cube[0], cube[3], cube[2],
  cube[2], cube[3], cube[7], cube[6],
  cube[3], cube[0], cube[4], cube[7],
  cube[6], cube[5], cube[1], cube[2],
  cube[4], cube[5], cube[6], cube[7],
  cube[5], cube[4], cube[0], cube[1]
];


var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zView = 5.0;

var proLoc;
var mvLoc;
var colorLoc;


// values for each fish
var rotTail = [];
var incTail = [];

var rotFin = [];
var incFin = [];

var fishSpeed = [];

var direction = [];
var yPos = [];
var xPos = [];
var zPos = [];
var colors = []


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
 
    gl.enable(gl.DEPTH_TEST);
 
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    var combinedVertices = vertices_fish.concat(vertices_cube);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(combinedVertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // get uniform variables
    colorLoc = gl.getUniformLocation( program, "fColor" );
    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Setjum ofanvarpsfylki h�r � upphafi
    var proj = perspective( 90.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));

    for ( var i = 0; i < 10; i++ ) {
      // direction
      var dir =  Math.random() * 360;
      direction.push(dir);

      // postition
      var xPosition =  Math.random() * (1.5 - (-1.5)) -1.5;
      xPos.push(xPosition);
      var yPosition = (Math.random() * 3.6) - 1.8;
      yPos.push(yPosition);
      var zPosition =  Math.random() * (1.5 - (-1.5)) -1.5;
      zPos.push(zPosition);

      //speed
      var speed = Math.random() * (0.05 - 0.003) + 0.003;
      fishSpeed.push(speed);

      //color
      var color = vec4(Math.random(), Math.random(), Math.random(), 1.0);
      colors.push(color);

      // rot and inc
      var rot1 = Math.random() * 70 - 35;
      rotTail.push(rot1);
      var inc1 = Math.random() * 2.0 + 1.0;
      incTail.push(inc1);

      var rot2 = Math.random() * 70 - 35;
      rotFin.push(rot2);
      var inc2 = Math.random() * 2.0 + 1.0;
      incFin.push(inc2);
    }
    

    // Event to drag canvas
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // Event from keyboard
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp �r
                zView -= 0.2;
                break;
            case 40:	// ni�ur �r
                zView += 0.2;
                break;
         }
     }  );  

     // Event from scrolling
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zView += 0.2;
         } else {
             zView -= 0.2;
         }
     }  );  

    render();
}


function drawFish(mv, nr){

    var angleInRadians = radians(direction[nr]+90);

    xPos[nr] += fishSpeed[nr] * Math.sin(angleInRadians);
    zPos[nr] += fishSpeed[nr] * Math.cos(angleInRadians);

    // check if fish is leaving the cube and then turn him around slowly
    if(xPos[nr] > 1.2 || xPos[nr] < -1.2 || zPos[nr] > 1.2 || zPos[nr] < -1.2){
      direction[nr] += 5
    }

    mv = mult(mv, translate(xPos[nr], yPos[nr], zPos[nr]));
    mv = mult(mv, rotateY(direction[nr]));
    gl.uniform4fv( colorLoc, colors[nr]);

    // Movement of the tail of the fish
    rotTail[nr] += incTail[nr];
    if( rotTail[nr] > 35.0  || rotTail[nr] < -35.0 )
      incTail[nr] *= -1;
      
    // movement of the fins of the fish
    rotFin[nr] += incFin[nr];
    if( rotFin[nr] > 35.0  || rotFin[nr] < -35.0 )
      incFin[nr] *= -1;

    // Body of fish
    var mv2 = mv;
    mv2 = mult( mv2, translate ( 0.0 , 0.5, 0.0 ) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, 0, NumBody );

    // Draw one fin
    var mv2 = mv;
    mv2 = mult( mv2, translate ( -0.5 , 0.0, 0.0 ) );
    mv2 = mult( mv2, rotateX( rotFin[nr] ) );
    mv2 = mult( mv2, translate ( 0.5, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv2));
    gl.drawArrays( gl.TRIANGLES, 24, 3 );

    //Draw the other fin
    var mv2 = mv;
    mv2 = mult( mv2, translate ( -0.5, 0.0, 0.0 ) );
    mv2 = mult( mv2, rotateX( -rotFin[nr] ) );
    mv2 = mult( mv2, translate ( 0.5, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv2));
    gl.drawArrays( gl.TRIANGLES, 27, 3 );
    

    // Sporður
    var mv3 = mv;
    mv3 = mult( mv3, translate (  -0.5, 0.0, 0.0 ) );
    mv3 = mult( mv3, rotateY( rotTail[nr] ) );
    mv3 = mult( mv3, translate (  0.5, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv3));
    gl.drawArrays( gl.TRIANGLES, NumBody, NumTail );
}

// draws the outline of the cube
function drawCube(mv){
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.uniform4fv( colorLoc, vec4(1.0, 0.0, 0.0, 0.5) );
  gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0) );
  for ( var i = 0; i < 6; i++ ) {
    gl.drawArrays( gl.LINE_LOOP, 30+(i*4), 4 );
  }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );

    drawCube(mv);

    // draw 10 fishes
    for ( var i = 0; i < 10; i++ ) {
      drawFish(mv, i);
    }

    requestAnimFrame( render );
}
