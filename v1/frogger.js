var canvas;
var gl;

var program;

var trianglePosition = [0.0, -0.8]; 
var triangleSpeed = 0.04;
var car_speed = [0.01, 0.02, 0.015];
var carPosition = [0.0, 0.0, 0.0]; // by x 
var moveObject = [0.0, 0.4, 0.8, 1.2];
var moveSidewalk = [0.0, 1.7];
var objectLocation;
var streetUpLocation;
var carSpeedLocation;
var carPositionLocation;
var frogPositionLocationx;
var frogPositionLocationy;
var sidewalkUpLocation;
var points = 0;
var movePointLocation;
var point_movement = 0.02;
var carcolors = [ vec4( 1.0, 0.0, 0.0, 1.0 ), 
                    vec4( 0.0, 1.0, 0.0, 1.0 ), 
                    vec4( 0.0, 0.0, 1.0, 1.0 ) ];
var direction = 'up';

var triangleVertices = [
    0.0, -0.15,
    0.15, -0.15,
    0.07, 0.0
];

var car = [
  0.8, -0.4,
  1.0, -0.4,
  1.0, -0.3,
  0.8, -0.3
]

var street = [
  -1.0, -0.45,
  1.0, -0.45,
  1.0, -0.25,
  -1.0, -0.25
];

var sidewalk = [
    -1.0, -1.0,
    1.0, -1.0,
    1.0, -0.7,
    -1.0, -0.7
  ];

var point = [
    0.8, 0.95,
    0.81, 0.95,
    0.81, 0.88,
    0.8, 0.88
  ];
  

var bufferId_tri;
var bufferId_car;
var bufferId_street;
var attributeLocation;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    bufferId_tri = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId_tri);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleVertices), gl.STATIC_DRAW);

    bufferId_car = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId_car);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(car), gl.STATIC_DRAW);

    bufferId_street = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId_street);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(street), gl.STATIC_DRAW);

    bufferId_sidewalk = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId_sidewalk);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sidewalk), gl.STATIC_DRAW);

    bufferId_point = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId_point);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(point), gl.STATIC_DRAW);

    attributeLocation = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(attributeLocation);
    //gl.vertexAttribPointer(attributeLocation, 2, gl.FLOAT, false, 0, 0);

    locColor = gl.getUniformLocation( program, "rcolor" );
    objectLocation = gl.getUniformLocation( program, "isShape" );
    streetUpLocation = gl.getUniformLocation(program, "streetUp");
    carSpeedLocation = gl.getUniformLocation(program, "carSpeed");
    carPositionLocation = gl.getUniformLocation(program, "carPosition");
    frogPositionLocationx = gl.getUniformLocation(program, "frogPositionx");
    frogPositionLocationy = gl.getUniformLocation(program, "frogPositiony");
    sidewalkUpLocation = gl.getUniformLocation(program, "sidewalkUp");
    movePointLocation = gl.getUniformLocation(program, "movePoint");
    

    window.addEventListener("keydown", moveTriangle);

    render();
}

function moveTriangle(event) {
    switch (event.keyCode) {
        case 37: // Left arrow
            trianglePosition[0] -= triangleSpeed;
            break;
        case 38: // Up arrow
            trianglePosition[1] += triangleSpeed;
            break;
        case 39: // Right arrow
            trianglePosition[0] += triangleSpeed;
            break;
        case 40: // Down arrow
            trianglePosition[1] -= triangleSpeed;
            break;
    }
}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    /* Sidewalk */
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId_sidewalk );
    gl.vertexAttribPointer( attributeLocation, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, vec4(0.522, 0.282, 0.02, 1.0) );
    gl.uniform1i( objectLocation, 4);
    for (var i = 0; i < 2; i += 1) {
        gl.uniform1f( sidewalkUpLocation, moveSidewalk[i]);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }


    /* Street */
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId_street );
    gl.vertexAttribPointer( attributeLocation, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, vec4(0.7, 0.7, 0.7, 1.0) );
    gl.uniform1i( objectLocation, 1);

    for (var i = 0; i < 3; i += 1) {
        gl.uniform1f( streetUpLocation, moveObject[i]);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    /* Car */
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId_car );
    gl.vertexAttribPointer( attributeLocation, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform1i( objectLocation, 3);

    
    for (var i = 0; i < 3; i += 1) {
        gl.uniform4fv( locColor, carcolors[i] );
        carPosition[i] -= car_speed[i];
        if(carPosition[i] < -2.0){ /* Make car go back to the beginning if it leaves on the left */
            carPosition[i] = 1.0;
        }
    var add;
    if(direction == 'down'){
        add = 0.15;
    }
    else {
        add = 0.0;
    }
    var xt = (1.0 + trianglePosition[0]);
    var yt = (1.0 - trianglePosition[1] - add);
    var xc = (1.0 + (carPosition[i]+ 0.8));
    var yc = (1.0 - (-0.3 + moveObject[i]));



        
        if (
            !((yt + 0.15) < yc ||
            (yt > (yc + 0.1)) ||
            ((xt + 0.15 ) < xc) ||
            (xt > (xc + 0.2)))
          ) {
            // Collision detected with the car, take action here
            console.log("Triangle has collided with the car.");
            document.getElementById('points').innerText = 'You Lost! with ' + points + ' points';
            return;
          }

        gl.uniform1f( carPositionLocation, carPosition[i]);
        gl.uniform1f( streetUpLocation, moveObject[i]);
        gl.uniform1f( carSpeedLocation, car_speed[i]);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    /* Frog */  
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId_tri );
    gl.vertexAttribPointer( attributeLocation, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, vec4(0.173, 0.58, 0.051, 1.0) );
    gl.uniform1i( objectLocation, 2);
    if(trianglePosition[1] > 1.0 && direction == 'up'){
        triangleVertices = [
            0.0, 0.15,
            0.15, 0.15,
            0.07, 0.0
        ];
        trianglePosition = [0.0, 0.8]; 
        points += 1;
        direction = 'down';
        gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleVertices), gl.STATIC_DRAW);
    }
    else if(trianglePosition[1] < -1 && direction == 'down'){
        triangleVertices = [
            0.0, -0.15,
            0.15, -0.15,
            0.07, 0.0
        ];
        trianglePosition = [0.0, -0.8]; 
        points+= 1;
        direction = 'up';
        gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleVertices), gl.STATIC_DRAW);
    }
    gl.uniform1f( frogPositionLocationx, trianglePosition[0]);
    gl.uniform1f( frogPositionLocationy, trianglePosition[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* Points */
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId_point );
    gl.vertexAttribPointer( attributeLocation, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, vec4(1.0, 1.0, 1.0, 1.0) );
    gl.uniform1i( objectLocation, 5);
    for (var i = 0; i < points; i += 1) {
        var move = point_movement * i;
        gl.uniform1f( movePointLocation, i*0.02);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        if(points == 10){
            document.getElementById('points').innerText = 'You won!';
            points = 0;
        }
        else if(points == 1){
            document.getElementById('points').innerText = '';
        }
    }
    
    window.requestAnimationFrame(render);
   
}
