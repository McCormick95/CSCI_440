"use strict";

var gl;
var pointsArray = [];

var theta = 0.0;
var speed = 1.0;

var colorLoc;
var orange1, orange2, orange3, orange4, orange5;

var modelViewMatrixLoc; 
var modelViewMatrix;

var user_selection = 0;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);

	orange1 = vec4(255/255, 165/255, 0, 1.0);
	orange2 = vec4(255/255, 192/255, 0, 1.0);
	orange3 = vec4(255/255, 117/255, 24/255, 1.0);
	orange4 = vec4(255/255, 234/255, 0, 1.0);
	orange5 = vec4(255/255, 250/255, 160/255, 1.0);
	
	// DO NOT MODIFY OR ADD VERTICES //
 	pointsArray.push(vec4( 0.2, 0.2, 0, 1));
	pointsArray.push(vec4( 0.4, 0.6, 0, 1));
	pointsArray.push(vec4( 0.6, 0.2, 0, 1));
	
    // DO NOT MODIFY OR ADD BUFFERS //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
	
	colorLoc = gl.getUniformLocation(program, "uColor");
	
	modelViewMatrixLoc = gl.getUniformLocation( program, "uModelViewMatrix" );

    // Initialize event handlers
    document.getElementById("Eyes button").onclick = function () {
		user_selection = 0;
    };
	
    document.getElementById("Teeth button").onclick = function () {
		user_selection = 2;
    };
	
    document.getElementById("Spin button").onclick = function () {
		user_selection = 3;
    };
	
    render();
};

var triangle_scales =[
    vec3(0.5, 1.0, 0.0),  
    vec3(4.0, -.4, 0.0),  
    vec3(-0.25, -0.25, 0.0), 
    vec3(0.5, 0.5, 0.0)   
];

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
	theta += speed;

	modelViewMatrix = mat4();

	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniform4fv(colorLoc, orange1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    if(user_selection == 0) { //eyes
        
	    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange1);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(-0.8, 0.0, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange1);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[0][0], triangle_scales[0][1], triangle_scales[0][2]));
        modelViewMatrix = mult(modelViewMatrix, translate(-0.4, -0.4, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange2);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[1][0], triangle_scales[1][1], triangle_scales[1][2]));
        modelViewMatrix = mult(modelViewMatrix, translate(-0.4, .8, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange3);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    }
    else if(user_selection == 2) { //teeth
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange1);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(-0.8, 0.0, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange1);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[0][0], triangle_scales[0][1], triangle_scales[0][2]));
        modelViewMatrix = mult(modelViewMatrix, translate(-0.4, -0.4, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange2);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[1][0], triangle_scales[1][1], triangle_scales[1][2]));
        modelViewMatrix = mult(modelViewMatrix, translate(-0.4, .8, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange3);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[2][0], triangle_scales[2][1], triangle_scales[2][2]));
        modelViewMatrix = mult(modelViewMatrix, translate(-0.8, 1.4, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange5);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[2][0], triangle_scales[2][1], triangle_scales[2][2]));
        modelViewMatrix = mult(modelViewMatrix, translate(-0.1, 1.4, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange5);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(-0.6, 0.0, 0.0));
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[0][0], triangle_scales[0][1], triangle_scales[0][2]));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange5);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(0.2, 0.0, 0.0));
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[0][0], triangle_scales[0][1], triangle_scales[0][2]));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange5);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
    }
    else if(user_selection == 3) { //spin
        var r1 = rotateX(theta, vec3(.2, 0, 0));
        var r2 = rotateY(theta, vec3(0, .2, 0));
        var r3 = rotateZ(theta);


        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange1);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(-0.8, 0.0, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange1);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, r1);
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[0][0], triangle_scales[0][1], triangle_scales[0][2]));
        modelViewMatrix = mult(modelViewMatrix, translate(-0.4, -0.4, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange2);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[1][0], triangle_scales[1][1], triangle_scales[1][2]));
        modelViewMatrix = mult(modelViewMatrix, translate(-0.4, .8, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange3);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[2][0], triangle_scales[2][1], triangle_scales[2][2]));
        modelViewMatrix = mult(modelViewMatrix, translate(-0.8, 1.4, 0.0));
        modelViewMatrix = mult(modelViewMatrix, r2);
        modelViewMatrix = mult(modelViewMatrix, r1);
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange5);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, r2);
        modelViewMatrix = mult(modelViewMatrix, r1);
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[2][0], triangle_scales[2][1], triangle_scales[2][2]));
        modelViewMatrix = mult(modelViewMatrix, r2);
        modelViewMatrix = mult(modelViewMatrix, r1);
        modelViewMatrix = mult(modelViewMatrix, translate(-0.1, 1.4, 0.0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange5);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, r2);
        modelViewMatrix = mult(modelViewMatrix, r1);
        modelViewMatrix = mult(modelViewMatrix, translate(-0.6, 0.0, 0.0));
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[0][0], triangle_scales[0][1], triangle_scales[0][2]));
        modelViewMatrix = mult(modelViewMatrix, r2);
        modelViewMatrix = mult(modelViewMatrix, r1);
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange5);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, r2);
        modelViewMatrix = mult(modelViewMatrix, r1);
        modelViewMatrix = mult(modelViewMatrix, translate(0.2, 0.0, 0.0));
        modelViewMatrix = mult(modelViewMatrix, scale(triangle_scales[0][0], triangle_scales[0][1], triangle_scales[0][2]));
        modelViewMatrix = mult(modelViewMatrix, r1);
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange5);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
    }



	requestAnimationFrame(render);
 }
