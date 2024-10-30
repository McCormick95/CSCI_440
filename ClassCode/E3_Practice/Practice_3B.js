"use strict";

var shadow = function() {

var canvas;
var gl;
var positionsArray = [];
var near = -4;
var far = 4;
var theta  = 0.0;
var left = -2.0;
var right = 2.0;
var top = 2.0;
var bottom = -2.0;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var colorLoc;
var eye, at, up;
var light;
var m;
var black;
var colorsArray= [];
var solidColorArray = [];

var toggle = 1; 
var scan_1 = false;
var scan_2 = false;
var zoom_in = false;
var zoom_out = false;
var reset_drone = false;
var reset_light = false;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    light = vec3(0.0, 2.0, 0.0);

// matrix for shadow projection
    m = mat4();
    m[3][3] = 0;
    m[3][1] = -1/light[1];

//console.log("m");
//printm(m);
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    eye = vec3(1.0, 1.0, 1.0);

    // color square red and shadow black
    var vertexColors = [
        vec4(1.0, 0.0, 0.0, 1.0),  // Red for top-right
        vec4(0.0, 1.0, 0.0, 1.0),  // Green for top-left
        vec4(0.0, 0.0, 1.0, 1.0),   // Blue for bottom-left
        vec4(1.0, 1.0, 0.0, 1.0),  // Yellow for bottom-right
        vec4(0.5, .5, .5, 1.0),  // Yellow for bottom-right
        vec4(0.5, .5, .5, 1.0),  // Yellow for bottom-right
        vec4(0.5, .5, .5, 1.0),  // Yellow for bottom-right
        vec4(0.5, .5, .5, 1.0)  // Yellow for bottom-right

    ];

    black = vec4(0.0, 0.0, 0.0, 1.0);

    // square
    positionsArray.push(vec4(-0.5, 0.5,  -0.5, 1.0));
    positionsArray.push(vec4(-0.5,  0.5,  0.5, 1.0));
    positionsArray.push(vec4(0.5, 0.5,  0.5, 1.0));
    positionsArray.push(vec4(0.5,  0.5,  -0.5, 1.0));

    positionsArray.push(vec4(-0.5, 0.5,  -0.5, 1.0));
    positionsArray.push(vec4(-0.5,  0.5,  0.5, 1.0));
    positionsArray.push(vec4(0.5, 0.5,  0.5, 1.0));
    positionsArray.push(vec4(0.5,  0.5,  -0.5, 1.0));

    colorsArray.push(vec4(1.0, 0.0, 0.0, 1.0)); // Red for top-right
    colorsArray.push(vec4(0.0, 1.0, 0.0, 1.0));  // Green for top-left
    colorsArray.push(vec4(0.0, 0.0, 1.0, 1.0));   // Blue for bottom-left
    colorsArray.push(vec4(1.0, 1.0, 0.0, 1.0)); 
        
    colorsArray.push(vec4(0.0, 0.0, 0.0, 1.0)); // Red for top-right
    colorsArray.push(vec4(0.0, 0.0, 0.0, 1.0));  // Green for top-left
    colorsArray.push(vec4(0.0, 0.0, 0.0, 1.0));   // Blue for bottom-left
    colorsArray.push(vec4(0.0, 0.0, 0.0, 1.0));// Yellow for bottom-right

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // color buffer
    var cBuffer = gl.createBuffer(); // creation
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer); // binding
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    
    colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    colorLoc = gl.getUniformLocation(program, "uColor");

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    document.getElementById("menu_1" ).onclick = function(event) {
        switch(event.target.index) {
            case 0:
                eye[0] += 0.2
                break;
            case 1:
                eye[0] -= 0.2
                break;
            case 2:
                eye[1] += 0.2
                break;
            case 3:
                eye[1] -= 0.2
                break;
            case 4:
                eye[2] += 0.2
                break;
            case 5:
                eye[2] -= 0.2
                break;
       }
    };

    document.getElementById("menu_2" ).onclick = function(event) {
        switch(event.target.index) {
            case 0:
                light[0] += 0.2
                break;
            case 1:
                light[0] -= 0.2
                break;
            case 2:
                light[1] += 0.2
                break;
            case 3:
                light[1] -= 0.2
                break;
            case 4:
                light[2] += 0.2
                break;
            case 5:
                light[2] -= 0.2
                break;
       }
    };

    document.getElementById("menu_3" ).onclick = function(event) {
        switch(event.target.index) {
            case 0:
                scan_1 = true;
                scan_2 = false;
                break;
            case 1:
                scan_2 = true;
                scan_1 = false;
                break;
            case 2:
                zoom_in = true;
                zoom_out = false;
                reset_drone = false
                break;
            case 3:
                zoom_out = true;
                zoom_in = false;
                reset_drone = false;
                break;
            case 4:
                reset_drone = true;
                scan_1 = false;
                scan_2 = false;
                zoom_in = false;
                zoom_out = false;
                break;
            case 5:
                reset_light = true;
                break;
       }
    };
    render();
}

var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var eye_x = eye[0];
        var eye_y = eye[1];
        
        if(scan_1){
            eye_x += 0.2 * toggle;
            
            if(eye_x >= 2.0 || eye_x <= -2.0){
                toggle *= -1;
            }

            eye[0] = eye_x;
        }
        else if(scan_2){
            eye_y += 0.2 * toggle;
            
            if(eye_y >= 2.0 || eye_y <= -2.0){
                toggle *= -1;
            }

            eye[1] = eye_y;
        }

        if(zoom_in){
            left = -1;
            right = 1;
            top = 1;
            bottom = -1;
        }

        if(zoom_out){
            left = -4;
            right = 4;
            top = 4;
            bottom = -4;
        }

        if(reset_drone){
            eye = vec3(1.0, 1.0, 1.0);
            left = -2.0;
            right = 2.0;
            top = 2.0;
            bottom = -2.0;

            reset_drone = false;
        }

        if(reset_light){
            light = vec3(0.0, 2.0, 0.0);
            reset_light = false;
        }

        // model-view matrix for square
        modelViewMatrix = lookAt(eye, at, up);

        // send color and matrix for square then render
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        //gl.uniform4fv(colorLoc, red);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        // rotate light source
        // light[0] = Math.sin(theta);
        // light[2] = Math.cos(theta);

        modelViewMatrix = mult(modelViewMatrix, translate(light[0], light[1], light[2]));

        modelViewMatrix = mult(modelViewMatrix, m);

        modelViewMatrix = mult(modelViewMatrix, translate(-light[0], -light[1], -light[2]));

        // send color and matrix for shadow
        //gl.uniform4fv(colorLoc, black); // Set the color to black for the shadow

        projectionMatrix = ortho(left, right, bottom, top, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);

        requestAnimationFrame(render);
    }
}

shadow();
