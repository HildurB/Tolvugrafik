"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 4;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  -1,  1 ),
        vec2(  1, 1 ),
        vec2(  1, -1 ),
    ];

    divideRectangle( vertices[0], vertices[1], vertices[2],vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function Rectangle( a, b, c, d)
{
    points.push( a, c, d );
    points.push( a, b, c );
}

function divideRectangle( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        Rectangle( a, b, c, d );
    }
    else {

        //bisect the sides

        var ab1 = mix( a, b, 1/3 );
        var ab2 = mix( a, b, 2/3 );
        var bc1 = mix( b, c, 1/3 );
        var bc2 = mix( b, c, 2/3 );
        var cd1 = mix( c, d, 1/3 );
        var cd2 = mix( c, d, 2/3 );
        var da1 = mix( d, a, 1/3 );
        var da2 = mix( d, a, 2/3 );

        var ma = mix( da2, bc1, 1/3 );
        var mb = mix( da2, bc1, 2/3 );
        var md = mix( da1, bc2, 1/3 );
        var mc = mix( da1, bc2, 2/3 );

        --count;

        // 8 new rectangles

        divideRectangle( a, ab1, ma, da2, count );
        divideRectangle( ab1, ab2, mb, ma, count );
        divideRectangle( ab2, b, bc1, mb, count );

        divideRectangle( mb,bc1,bc2,mc, count );
        divideRectangle( mc, bc2, c, cd1, count );
        divideRectangle( md, mc, cd1, cd2, count );

        divideRectangle( da1, md, cd2, d, count );
        divideRectangle( da2, ma, md, da1, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
