"use strict";

var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];

var m_Matrix;
var MatrixLoc;

var  angle = 0;
var  axis = vec3(1, 1, 0);
var orbit_axis = vec3(0, 0, 1);
var orbit_angle = 0;

var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;

var status_u = 0;
var pause_status = 0;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 )   // white
  ];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor");
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );
    
    //gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));

    document.getElementById("settings").onclick = function() {
        var selectedOption = this.options[this.selectedIndex];
        alert("Selected: " + selectedOption.text);

        if(selectedOption.value == 1){
            status_u = 1;
            
        }
        else if(selectedOption.value == 2){
            status_u = 2;
        }
        else if(selectedOption.value == 3){
            status_u = 3;
        }
        else{
            status_u = 0;
            
        }
    };

    document.getElementById("pause").onclick = function() {
        alert("Pause");
        if(pause_status == 0){
            pause_status = 1;
        }
        else{
            pause_status = 0;
        }
    };

    //m_Matrix = mat4();
    MatrixLoc = gl.getUniformLocation(program, "m_Matrix");

    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var indices = [ a, b, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push(vertices[indices[i]]);

        if(status_u == 1){
            // for interpolated colors use
            colors.push(vertexColors[indices[i]]);  
        }
        else{
            // for solid colored faces use
            colors.push(vertexColors[a]);
        }
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Check if paused
    if (pause_status == 0) {
        // Only increment angle when not paused
        angle += Math.PI / 4; // Adjust this value for rotation speed
        orbit_angle += Math.PI / 15; // Adjust this value for orbit speed
    }

    // Ensure axis is a vec3 before calling rotate
    var r = rotate(angle, axis);

    // Reset model matrix to identity at the start of each frame
    m_Matrix = mat4();

    if (status_u == 0) {
        // Initial wire-frame cube
        m_Matrix = mult(m_Matrix, r);
        gl.uniformMatrix4fv(MatrixLoc, false, flatten(m_Matrix));
        for (var i = 0; i < positions.length; i += 4) {
            gl.drawArrays(gl.LINE_LOOP, i, 4);
        }
    } else if (status_u == 1) {
        // Scaled singular cube
        var s = scale(0.25, 0.25, 0.25);
        m_Matrix = mult(m_Matrix, r);
        m_Matrix = mult(m_Matrix, s);
        gl.uniformMatrix4fv(MatrixLoc, false, flatten(m_Matrix));
        for (var i = 0; i < positions.length; i += 4) {
            gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        }
    } else if (status_u == 2) {
        // Center scaled cube
        var s = scale(0.25, 0.25, 0.25);
        m_Matrix = mult(m_Matrix, r);
        m_Matrix = mult(m_Matrix, s);
        gl.uniformMatrix4fv(MatrixLoc, false, flatten(m_Matrix));
        for (var i = 0; i < positions.length; i += 4) {
            gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        }

        // Define the positions of the additional cubes
        var additionalCubes = [
            vec3(0.5, -0.25, 0.0),
            vec3(-0.6, 0.4, 0.0),
            vec3(0.3, 0.35, 0.0),
            vec3(-0.25, -0.25, 0.0)
        ];

    // Define a separate scaling factor for the additional cubes
    var additionalCubeScale = scale(0.1, 0.1, 0.1);

    // Render additional cubes
    for (var j = 0; j < additionalCubes.length; j++) {
        var orbit = rotate(orbit_angle, orbit_axis);

        // Reset model matrix to identity
        var cubeMatrix = mat4();

        // Apply rotation around the center cube (orbit)
        cubeMatrix = mult(cubeMatrix, orbit);

        // Apply translation to position the cube
        var translation = translate(additionalCubes[j][0], additionalCubes[j][1], additionalCubes[j][2]);
        cubeMatrix = mult(cubeMatrix, translation);

        // Apply separate scaling for the additional cubes
        cubeMatrix = mult(cubeMatrix, additionalCubeScale);

        // Apply rotation around their own axes
        var selfRotation = rotate(angle, vec3(1, 1, 0)); // Rotate around the diagonal axis
        cubeMatrix = mult(cubeMatrix, selfRotation);

        // Pass the transformation matrix to the shader for the additional cube
        gl.uniformMatrix4fv(MatrixLoc, false, flatten(cubeMatrix));

        // Draw the additional cube
        for (var i = 0; i < positions.length; i += 4) {
            gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        }
    }
}

requestAnimationFrame(render);
}

// Call this function to start the rendering
// function startRendering() {
//     requestAnimationFrame(render);
// }
