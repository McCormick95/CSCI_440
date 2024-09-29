"use strict";

var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];

var m_Matrix;
var MatrixLoc;

var  angle = 0.0;
var  axis = vec3(0, 0, 1);

var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;

var status_u = -1;
var pause_status = 1;



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

    m_Matrix = mat4();
    MatrixLoc = gl.getUniformLocation(program, "uMatrix");
    
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

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

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

function render()
{
    if(pause_status == 0){
        axis = [1, 1, 0];
        angle = 0;
    }

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //m_Matrix = mult(translate(0.025, .025, 0), rotate(angle, axis));

    m_Matrix = mult(m_Matrix, rotate(angle, axis));

    gl.uniformMatrix4fv(MatrixLoc, false, flatten(m_Matrix));

    if(status_u == 1){
        axis = [1, 1, 0];
        angle = Math.PI / 4;
        for( var i=0; i<positions.length; i+=4){
            gl.drawArrays( gl.TRIANGLE_FAN, i, 4);
        }
    }
    else{
        axis = [1, 1, 0];
        angle = Math.PI / 4;
        for( var i=0; i<positions.length; i+=4){
            gl.drawArrays( gl.LINE_LOOP, i, 4);
        }
    }
    
    
    requestAnimationFrame( render );
}
