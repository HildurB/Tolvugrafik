var canvas;
var gl;

// Núverandi staðsetning miðju ferningsins
var box = vec2( 0.0, 0.0 );

// Stefna (og hraði) fernings
var dX;
var dY;

// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// Hálf breidd/hæð ferningsins
var boxRad = 0.05;

// Ferningurinn er upphaflega í miðjunni
var vertices = new Float32Array([-0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, 0.05]);

var vertices_spadi = [
  vec2( -0.2, -0.9 ),
  vec2( -0.2, -0.86 ),
  vec2(  0.2, -0.86 ),
  vec2(  0.2, -0.9 ) 
];
var bufferId_box;
var bufferId_spadi;
var vPosition;
var locColor;


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Gefa ferningnum slembistefnu í upphafi
    //dX = Math.random()*0.1-0.05;
    //dY = Math.random()*0.1-0.05;
    dX = 0.015;
    dY = 0.015;


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    bufferId_box = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId_box );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    bufferId_spadi = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId_spadi );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices_spadi), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );



    locBox = gl.getUniformLocation( program, "boxPos" );
    locColor = gl.getUniformLocation( program, "rcolor" );

    // Meðhöndlun örvalykla
    /*
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 38:	// upp ör
                dX *= 1.1;
                dY *= 1.1;
                break;
            case 40:	// niður ör
                dX /= 1.1;
                dY /= 1.1;
                break;
        }
    } );
    */

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
      switch( e.keyCode ) {
          case 37:	// vinstri ör
              xmove = -0.04;
              break;
          case 39:	// hægri ör
              xmove = 0.04;
              break;
          default:
              xmove = 0.0;
      }
      for(i=0; i<4; i++) {
        vertices_spadi[i][0] += xmove*2;
      }

      //gl.bindBuffer( gl.ARRAY_BUFFER, bufferId_spadi );
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices_spadi));
  } );

    render();
}


function render() {
    
    // Láta ferninginn skoppa af veggjunum
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX; // hliðum
    //if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY; // Upp og niður

    if ((box[1] + dY) > maxY - boxRad) dY = -dY; // skoppar af vegnum uppi
    if ((-(box[1] + dY) > 0.86 - boxRad) && (box[0] + boxRad >= vertices_spadi[1][0]) && (box[0] - boxRad <= vertices_spadi[2][0])) {
      dY = -dY;
    }
    if (-(box[1] + dY) > maxY - boxRad) {
      document.getElementById('message').innerText = 'You Lost!';
      gl.clear( gl.COLOR_BUFFER_BIT );
      return;
    }

    // Uppfæra staðsetningu
    box[0] += dX;
    box[1] += dY;
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    //
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId_box );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, vec4(1.0, 0.0, 0.0, 1.0) );
    gl.uniform2fv( locBox, flatten(box) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId_spadi );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, vec4(0.0, 0.0, 1.0, 1.0) );
    gl.uniform2fv( locBox, [0,0]);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
  


    window.requestAnimationFrame(render);
}