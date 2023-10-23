/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Forrit með tveimur mynstrum.  Sýnir vegg með
//     múrsteinsmynstri og gólf með viðarmynstri.  Það er hægt
//     að ganga um líkanið, en það er engin árekstarvörn.
//
//    Hjálmtýr Hafsteinsson, mars 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices  = 6;

var program;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texture;
var texVegg;
var texGolf;
var texLoft;

// Breytur fyrir hreyfingu áhorfanda
var userXPos = 0.0;
var userZPos = 2.0;
var userIncr = 0.1;                // Size of forward/backward step
var userAngle = 270.0;             // Direction of the user in degrees
var userXDir = 0.0;                // X-coordinate of heading
var userZDir = -1.0;               // Z-coordinate of heading


var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -5.0;

var proLoc;
var mvLoc;

// Hnútar veggsins
var vertices = [
    vec4( -5.0,  0.0, 0.0, 1.0 ),
    vec4(  5.0,  0.0, 0.0, 1.0 ),
    vec4(  5.0,  1.0, 0.0, 1.0 ),
    vec4(  5.0,  1.0, 0.0, 1.0 ),
    vec4( -5.0,  1.0, 0.0, 1.0 ),
    vec4( -5.0,  0.0, 0.0, 1.0 ),
// Hnútar gólfsins (strax á eftir)
    vec4( -5.0,  0.0, 10.0, 1.0 ),
    vec4(  5.0,  0.0, 10.0, 1.0 ),
    vec4(  5.0,  0.0,  0.0, 1.0 ),
    vec4(  5.0,  0.0,  0.0, 1.0 ),
    vec4( -5.0,  0.0,  0.0, 1.0 ),
    vec4( -5.0,  0.0, 10.0, 1.0 )
];

// Mynsturhnit fyrir vegg
var texCoords = [
    vec2(  0.0, 0.0 ),
    vec2( 10.0, 0.0 ),
    vec2( 10.0, 1.0 ),
    vec2( 10.0, 1.0 ),
    vec2(  0.0, 1.0 ),
    vec2(  0.0, 0.0 ),
// Mynsturhnit fyrir gólf
    vec2(  0.0,  0.0 ),
    vec2( 10.0,  0.0 ),
    vec2( 10.0, 10.0 ),
    vec2( 10.0, 10.0 ),
    vec2(  0.0, 10.0 ),
    vec2(  0.0,  0.0 )
];
var colorLoc;


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // Lesa inn og skilgreina mynstur fyrir vegg
    
    var veggImage = document.getElementById("VeggImage");
    texVegg = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texVegg );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, veggImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    // Lesa inn og skilgreina mynstur fyrir gólf
    var golfImage = document.getElementById("GolfImage");
    texGolf = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texGolf );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, golfImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

        // Lesa inn og skilgreina mynstur fyrir Loft
    var cloudImage = document.getElementById("CloudImage");
    texLoft = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texLoft );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cloudImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
        
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
      


    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );
    //colorLoc = gl.getUniformLocation( program, "fColor" );

    var proj = perspective( 50.0, 1.0, 0.2, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            userAngle += 0.4*(origX - e.clientX);
            userAngle %= 360.0;
            userXDir = Math.cos( radians(userAngle) );
            userZDir = Math.sin( radians(userAngle) );
            origX = e.clientX;
        }
    } );
    
    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 87:	// w
                userXPos += userIncr * userXDir;
                userZPos += userIncr * userZDir;;
                break;
            case 83:	// s
                userXPos -= userIncr * userXDir;
                userZPos -= userIncr * userZDir;;
                break;
            case 65:	// a
                userXPos += userIncr * userZDir;
                userZPos -= userIncr * userXDir;;
                break;
            case 68:	// d
                userXPos -= userIncr * userZDir;
                userZPos += userIncr * userXDir;;
                break;
         }
     }  );  

    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  


    render();
 
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // staðsetja áhorfanda og meðhöndla músarhreyfingu
    var mv = lookAt( vec3(userXPos, 0.5, userZPos), vec3(userXPos+userXDir, 0.5, userZPos+userZDir), vec3(0.0, 1.0, 0.0 ) );
    
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    // Teikna vegg með mynstri
    gl.bindTexture( gl.TEXTURE_2D, texVegg );
    //gl.uniform4fv( colorLoc, vec4(0.173, 0.58, 0.051, 1.0) );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );


        // Teikna gólf með mynstri
    gl.bindTexture( gl.TEXTURE_2D, texGolf );
    //gl.uniform4fv( colorLoc, vec4(1.0, 0.0, 0.0, 1.0) );
    gl.drawArrays( gl.TRIANGLES, numVertices, numVertices );

    

    // veggur 2
    //gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 1.0, 1.0) );
    gl.bindTexture( gl.TEXTURE_2D, texVegg );
    var mv1 = mv;
    mv1 = mult( mv1, translate( 5.0, 0.0, 5.0) );
    mv1 = mult( mv1, rotateY( 90.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Veggur 3
    //gl.uniform4fv( colorLoc, vec4(0.0, 1.0, 1.0, 1.0) );
    gl.bindTexture( gl.TEXTURE_2D, texVegg );
    var mv2 = mv;
    mv2 = mult( mv2, translate( -5.0, 0.0, 5.0) );
    mv2 = mult( mv2, rotateY( 90.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv2));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Veggur 4
    //gl.uniform4fv( colorLoc, vec4(1.0, 0.0, 1.0, 1.0) );
    gl.bindTexture( gl.TEXTURE_2D, texVegg );
    var mv3 = mv;
    mv3 = mult( mv3, translate( 0.0, 0.0, 10.0) );
    mv3 = mult( mv3, rotateY( 180.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv3));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Þak
    //gl.uniform4fv( colorLoc, vec4(1.0, 1.0, 0.0, 1.0) );
    gl.bindTexture( gl.TEXTURE_2D, texLoft );
    var mv4 = mv;
    mv4 = mult( mv4, translate( 0.0, 1.0, 0.0) );
    mv4 = mult( mv4, rotateZ( 180.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv4));
    gl.drawArrays( gl.TRIANGLES, numVertices, numVertices );

    


    requestAnimFrame(render);
}