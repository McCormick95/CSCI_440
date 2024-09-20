"use strict";

var gl;

var theta = 0.0;
var thetaLoc;

var speed = 0.1;

var pause = -1;
var direction = 1;
var faster = -1;
var slower = -1;
var changeColor = -1;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vertices = [
        vec3( 0.0, 0.05, 0.0),
        vec3( 0.5, 0.5, 0.0),
        vec3(-0.5, 0.5, 0.0),

        vec3(0.5, -0.5, 0.0),
        vec3(0.0, -0.05, 0.0),
        vec3(-0.5, -0.5, 0.0)
    ];

    var r_colors=[
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(0.0, 1.0, 0.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(1.0, 1.0, 0.0, 1.0),
        vec4(1.0, 0.0, 1.0, 1.0),
        vec4(0.0, 1.0, 1.0, 1.0)
    ];

    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation( program, "uTheta" );

    // Initialize event handlers
    document.getElementById("Color").onclick = function () {
        gl.enableVertexAttribArray( r_colors);
    };

    document.getElementById("Controls" ).onclick = function(event) {
        switch(event.target.index) {
         case 0: //pause
            pause = 0;
            direction = -1;
            faster = -1;
            slower = -1;

            break;
         case 1: //direction
            pause = -1;
            direction = 1;
            faster = -1;
            slower = -1;

            break;
         case 2: //faster
            pause = -1;
            direction = -1;
            faster = 2;
            slower = -1;

            break;
         case 3: //slower
            pause = -1;
            direction = -1;
            faster = -1;
            slower = 3;

            break;
		}
    };

    render();
};

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (pause == 0) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
        gl.drawArrays(gl.TRIANGLE_STRIP, 3, 3);
    }
    else if (direction == 1) {
        theta += speed;
        gl.uniform1f(thetaLoc, -theta);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
        gl.drawArrays(gl.TRIANGLE_STRIP, 3, 3);
    }
    else if(faster == 2) {
        theta += speed + speed;
        gl.uniform1f(thetaLoc, theta);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
        gl.drawArrays(gl.TRIANGLE_STRIP, 3, 3);
    }
    else if(slower == 3){
        theta -= speed * speed;
        gl.uniform1f(thetaLoc, -theta);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
        gl.drawArrays(gl.TRIANGLE_STRIP, 3, 3);
    }

    // theta += speed;
	//gl.uniform1f(thetaLoc, theta);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 3, 3);

	requestAnimationFrame(render);

 }
