"use strict";

var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];
var colors_interp = [];

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
var color_select = 0;

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
    vec4( 0.0, 0.0, 0.0, 1.0 ),  
    vec4( 0.9, 0.3, 0.4, 1.0 ),  
    vec4( 0.45, 0.0, 0.8, 1.0 ),  
    vec4( 0.0, 0.9, 0.4, 1.0 ),  
    vec4( 0.35, 0.65, 0.75, 1.0),  
    vec4( 0.86, .7, 0.2, 1.0),  
    vec4( 0.5, 0.9, 0.0, 1.0 ),  
    vec4( 0.0, 0.0, 0.0, 1.0 )   
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

    document.getElementById("settings").onclick = function() {
        var selectedOption = this.options[this.selectedIndex];
        // alert("Selected: " + selectedOption.text);

        if(selectedOption.value == 1){              // Star Birth
            status_u = 1;
            color_select = 0;
            
        }
        else if(selectedOption.value == 2){         // Planetary Formation
            status_u = 2;
            color_select = 0;
        }
        else if(selectedOption.value == 3){         // Solar System
            status_u = 3;
            color_select = 1;
        }
        else{                                       // Nebula
            status_u = 0;
            color_select = 0;
        }

        if(color_select == 0){
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        }
        else{
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors_interp), gl.STATIC_DRAW);
        }
    };

    document.getElementById("pause").onclick = function() {
        //alert("Pause");
        if(pause_status == 0){
            pause_status = 1;
        }
        else{
            pause_status = 0;
        }
    };

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
        // interpolated 
        colors_interp.push(vertexColors[indices[i]]);  
        // solid colored 
        colors.push(vertexColors[a]);
    
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    if (pause_status == 0) {                        // Check if paused
        angle += Math.PI / 4; 
        orbit_angle += Math.PI / 15; 
    }

    var r = rotate(angle, axis);

    m_Matrix = mat4();

    if (status_u == 0) {                            // Initial wire-frame cube   
        m_Matrix = mult(m_Matrix, r);
        gl.uniformMatrix4fv(MatrixLoc, false, flatten(m_Matrix));
        for (var i = 0; i < positions.length; i += 4) {
            gl.drawArrays(gl.LINE_LOOP, i, 4);
        }
    } else if (status_u == 1) {                     // Scaled singular cube
        var s = scale(0.25, 0.25, 0.25);
        m_Matrix = mult(m_Matrix, r);
        m_Matrix = mult(m_Matrix, s);
        gl.uniformMatrix4fv(MatrixLoc, false, flatten(m_Matrix));
        for (var i = 0; i < positions.length; i += 4) {
            gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        }
    } else if (status_u == 2 || status_u == 3) {    // Scaled singular cube with additional cubes
        var s = scale(0.25, 0.25, 0.25);
        m_Matrix = mult(m_Matrix, r);
        m_Matrix = mult(m_Matrix, s);
        gl.uniformMatrix4fv(MatrixLoc, false, flatten(m_Matrix));
        for (var i = 0; i < positions.length; i += 4) {
            gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        }
        
        var additionalCubes = [                     // Positions for additional cubes
            vec3(0.5, -0.25, 0.0),
            vec3(-0.6, 0.4, 0.0),
            vec3(0.3, 0.35, 0.0),
            vec3(-0.25, -0.25, 0.0)
        ];
        
        var sep_scales = [                          // Scales for additional cubes
            vec3(0.15, 0.25, 0.25),
            vec3(0.2, 0.05, 0.0),
            vec3(0.04, 0.04, 0.04),
            vec3(0.03, 0.04, 0.0)
        ];
        
        for (var j = 0; j < additionalCubes.length; j++) { // additional cubes
            var orbit = rotate(orbit_angle, orbit_axis);

            var cubeMatrix = mat4();
            cubeMatrix = mult(cubeMatrix, orbit);

            var translation = translate(additionalCubes[j][0], additionalCubes[j][1], additionalCubes[j][2]);
            cubeMatrix = mult(cubeMatrix, translation);

            cubeMatrix = mult(cubeMatrix, scale(sep_scales[j][0], sep_scales[j][1], sep_scales[j][2]));

            var selfRotation = rotate(orbit_angle, vec3(1, 1, 0)); 
            cubeMatrix = mult(cubeMatrix, selfRotation);

            gl.uniformMatrix4fv(MatrixLoc, false, flatten(cubeMatrix));

            for (var i = 0; i < positions.length; i += 4) {
                gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
            }
        }
    }

    requestAnimationFrame(render);
}
