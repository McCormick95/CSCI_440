"use strict";

var canvas;
var gl;

var nRows = 50;
var nColumns = 50;

// data for radial hat function: sin(Pi*r)/(Pi*r)
var data = [];
for(var i = 0; i < nRows; ++i) {
    data.push([]);
    var x = Math.PI*(4*i/nRows-2.0);
    for(var j = 0; j < nColumns; ++j) {
        var y = Math.PI*(4*j/nRows-2.0);
        var r = Math.sqrt(x*x+y*y);
        // take care of 0/0 for r = 0
        data[i][j] = r ? Math.sin(r) / r : 1.0;
    }
}

var positionsArray = [];
var normalsArray = [];

var eye = vec3(0.0, 0.0, 1.0); 
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var left = -1.5;
var right = 1.5;
var ytop = 1.5;
var bottom = -1.5;
var near = -10;
var far = 10;

var radius = 2.0;
var theta = 0.0;
var phi = 0.0;

var lightPosition = vec4(0.0, 0.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var nMatrix, nMatrixLoc;

var ambientProduct, ambientProductLoc; 
var diffuseProduct, diffuseProductLoc;
var specularProduct, specularProductLoc;
var lightPositionLoc, shininessLoc;

var apt, bpt, cpt, dpt;

var initial_state = false;
var trick_1 = false;
var trick_2 = false;
var trick_3 = false;
var trick_4 = false;

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    // enable depth testing and polygon offset
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

	// vertex array of nRows*nColumns quadrilaterals
	// (two triangles/quad) from data
    for(var i=0; i<nRows-1; i++) {
        for(var j=0; j<nColumns-1;j++) {
			var apt = vec4(2*i/nRows-1, data[i][j], 2*j/nColumns-1, 1.0);
			var bpt = vec4(2*(i+1)/nRows-1, data[i+1][j], 2*j/nColumns-1, 1.0);
			var cpt = vec4(2*(i+1)/nRows-1, data[i+1][j+1], 2*(j+1)/nColumns-1, 1.0);
			var dpt = vec4(2*i/nRows-1, data[i][j+1], 2*(j+1)/nColumns-1, 1.0);
			positionsArray.push(apt);
			positionsArray.push(bpt);
			positionsArray.push(cpt);
			positionsArray.push(dpt);
			normalsArray.push(apt);
			normalsArray.push(bpt);
			normalsArray.push(cpt);
			normalsArray.push(dpt);
		}
	}

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    modelViewMatrixLoc = gl.getUniformLocation( program, "uModelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "uProjectionMatrix" );
    nMatrixLoc = gl.getUniformLocation( program, "uNormalMatrix" );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);	
	
	ambientProductLoc = gl.getUniformLocation(program,"uAmbientProduct");
	diffuseProductLoc = gl.getUniformLocation(program,"uDiffuseProduct");
	specularProductLoc = gl.getUniformLocation(program,"uSpecularProduct");
	lightPositionLoc = gl.getUniformLocation(program,"uLightPosition")
	shininessLoc = gl.getUniformLocation(program, "uShininess");
	
    gl.uniform4fv( ambientProductLoc, ambientProduct );
    gl.uniform4fv( diffuseProductLoc, diffuseProduct );
    gl.uniform4fv( specularProductLoc, specularProduct );
    gl.uniform4fv( lightPositionLoc, lightPosition );
    gl.uniform1f( shininessLoc,materialShininess );
	
	
	// Initialize event handlers
    // INITIAL
    document.getElementById("Button0").onclick = function () {
        initial_state = true;
        trick_1 = false;
        trick_2 = false;
        trick_3 = false;
        trick_4 = false;
    };
    // Trick 1
    document.getElementById("Button1").onclick = function () {
        trick_1 = !trick_1;
        initial_state = false;
        trick_2 = false;
        trick_3 = false;
        trick_4 = false;
    };
    // Trick 2
    document.getElementById("Button2").onclick = function () {
        trick_2 = !trick_2;
        initial_state = false;
        trick_1 = false;
        trick_3 = false;
        trick_4 = false;
    };
    // Trick 3
    document.getElementById("Button3").onclick = function () {
        trick_3 = !trick_3;
        initial_state = false;
        trick_1 = false;
        trick_2 = false;
        trick_4 = false;
    };
    // Trick 4
    document.getElementById("Button4").onclick = function () {
        trick_4 = !trick_4;
        initial_state = false;
        trick_1 = false;
        trick_2 = false;
        trick_3 = false;
    };
    render();
}

var angle = 0;
var orbit_angle = 0;
var axis = [0, 1, 0];

var new_light_pos = lightPosition[0];
var toggle = 1;
var eye_new = vec3(0.0, 0.0, -1.0);
var color_temp = materialDiffuse;
var pulse_speed = 0.25;


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(initial_state){
        eye = vec3(0.0, 0.0, 1.0);
        angle = 0;
        orbit_angle = 0;
        new_light_pos = lightPosition[0];
        color_temp = materialDiffuse;
        pulse_speed = 0.05;
        ytop = 1.5;
        bottom = -1.5;
    }
    

    if (trick_1) {                        // Check if paused
        angle += Math.PI / 4; 
        orbit_angle += Math.PI / 15; 
    }
    var r = rotate(angle, axis);


    if(trick_2){
        new_light_pos += 0.1 * toggle;
        
        if(new_light_pos >= 2.0 || new_light_pos <= -2.0){
            toggle *= -1;
        }

        lightPosition[0] = new_light_pos;
        eye = vec3(0.0, -4.0, 4.0);
    }


    if(trick_3){
        color_temp[0] += pulse_speed * toggle; 
        color_temp[1] += pulse_speed * toggle;
        color_temp[2] += pulse_speed * toggle;

        if(color_temp[0] >= 1.0 || color_temp[0] <= 0.0 || color_temp[1] >= 1.0 || color_temp[1] <= 0.0 || color_temp[2] >= 1.0 || color_temp[2] <= 0.0){
            toggle *= -1;
        }
        // var new_c = vec3(.5, .5, .5);
        // diffuseProduct = mult(lightDiffuse, new_c);
        materialDiffuse = color_temp;
        diffuseProduct = mult(lightDiffuse, materialDiffuse);



    }

    // not coming back
    if(trick_4){
        ytop += 0.01 * toggle;
        bottom -= 0.01 * toggle;

        // Toggle the direction of the focused gaze effect
        if(ytop >= 5 || bottom <= -5 || ytop >= 3 || bottom <= -3){
            focused_gaze_toggle *= -1;
        }
    }

    modelViewMatrix = lookAt(eye, at, up);	
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    modelViewMatrix = mult(modelViewMatrix, r);
    nMatrix = normalMatrix(modelViewMatrix, true);
	
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

	gl.uniform4fv( ambientProductLoc, flatten(ambientProduct) );
    gl.uniform4fv( diffuseProductLoc, flatten(diffuseProduct) );
    gl.uniform4fv( specularProductLoc, flatten(specularProduct) );	
    gl.uniform4fv( lightPositionLoc, flatten(lightPosition) );
    gl.uniform1f( shininessLoc, materialShininess );
	
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix)  );

    for(var i=0; i<positionsArray.length; i+=4) {
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
    }

    requestAnimationFrame(render);
}
