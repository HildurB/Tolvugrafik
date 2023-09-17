var gl;
var points;
var locColor;
var lastRenderTime;
var timeLocation;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var vertices = new Float32Array([-1, -1, 0, 1, 1, -1]);

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locColor = gl.getUniformLocation( program, "rcolor" );
    timeLocation = gl.getUniformLocation( program, "time" );

    lastRenderTime = 0;
    render();
};


function render() { 

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastRenderTime) / 1000.0;

    gl.uniform1f( timeLocation, deltaTime);
    gl.clear( gl.COLOR_BUFFER_BIT );
      gl.drawArrays( gl.TRIANGLES, 0, 3 );

      if (deltaTime >= 1) {
        lastRenderTime = currentTime;
      }
    window.requestAnimationFrame(render);
}
