"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 6;

var index = 0;

var positionsArray = [];
var normalsArray = [];

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(0.0, 0.7, 0.3, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var ambientProduct, diffuseProduct, specularProduct;

var nMatrix, nMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var color_toggle = 0;

var color_one = vec4(0.8, 0.2, 0.4, 1.0);
var color_two = vec4(0.0, 0.7, 0.3, 1.0);

var power_surge_status = false;
var pulse_speed = 0.1;
var pulse_toggle = 1;
var r_max, g_max, b_max;
var updateDiffuse;

function triangle(a, b, c) {
     positionsArray.push(a);
     positionsArray.push(b);
     positionsArray.push(c);

    // normals are vectors

     normalsArray.push(vec4(a[0],a[1], a[2], 0.0));
     normalsArray.push(vec4(b[0],b[1], b[2], 0.0));
     normalsArray.push(vec4(c[0],c[1], c[2], 0.0));

     index += 3;
}

function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else {
        triangle(a, b, c);
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( normalLoc);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    // Awakening
    document.getElementById("Button0").onclick = function(){
        if (color_toggle == 0){
            materialDiffuse = color_two;
            color_toggle = 1;
        } else {
            materialDiffuse = color_one;
            color_toggle = 0;
        }
        materialDiffuse = mult(lightDiffuse, materialDiffuse);
        updateDiffuseProduct(materialDiffuse);
    };
    // Power Surge
    document.getElementById("Button1").onclick = function(){
        power_surge_status = !power_surge_status;
        power_surge();
        
    };
    // Seeking Light
    document.getElementById("Button2").onclick = function(){
    
    };
    // Focused Gaze
    document.getElementById("Button3").onclick = function(){

    };


    gl.uniform4fv(gl.getUniformLocation(program,"uAmbientProduct"),flatten(ambientProduct));
    updateDiffuseProduct(materialDiffuse);
    gl.uniform4fv(gl.getUniformLocation(program,"uSpecularProduct"),flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,"uLightPosition"),flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,"uShininess"),materialShininess);

    render();
}

function updateDiffuseProduct(defuse) {
    diffuseProduct = mult(lightDiffuse, defuse);
    gl.uniform4fv(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "uDiffuseProduct"), flatten(diffuseProduct));
}

function power_surge(){
    var color_temp = materialDiffuse;
    if (power_surge_status) {

        color_temp[0] += pulse_speed * pulse_toggle; 
        color_temp[1] += pulse_speed * pulse_toggle;
        color_temp[2] += pulse_speed * pulse_toggle;

        color_temp[0] = Math.round(color_temp[0] * 10) / 10;  
        color_temp[1] = Math.round(color_temp[1] * 10) / 10;
        color_temp[2] = Math.round(color_temp[2] * 10) / 10;

        r_max = Math.min(1.0, color_temp[0]);
        g_max = Math.min(1.0, color_temp[1]);
        b_max = Math.min(1.0, color_temp[2]);

        color_temp[0] = Math.max(0.0, r_max);
        color_temp[1] = Math.max(0.0, g_max);
        color_temp[2] = Math.max(0.0, b_max);

        if(color_temp[1] == 1.00 || color_temp[1] == 0.0 || color_temp[2] == 1.0 || color_temp[2] == 0.0 || color_temp[0] == 1.0 || color_temp[0] == 0.0){
            pulse_toggle *= -1;
        }

        updateDiffuse = vec4(color_temp[0], color_temp[1], color_temp[2], 1.0);

        updateDiffuseProduct(updateDiffuse); 
        
        requestAnimationFrame(power_surge);
    }
    else{
        return;
    }
}

// Define the positions for two spheres
var position_1 = vec3(-1.5, 0, 0);  // Left sphere
var position_2 = vec3(1.5, 0, 0);   // Right sphere

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    phi = dr;
    
    // Render spheres
    render_sphere(position_1);
    render_sphere(position_2);

    requestAnimationFrame(render);
}

function render_sphere(position){
    var sphere_position = position;
    eye = vec3(radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    var viewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    var modelMatrix1 = translate(sphere_position[0], sphere_position[1], sphere_position[2]);
    modelViewMatrix = mult(viewMatrix, modelMatrix1);
    nMatrix = normalMatrix(modelViewMatrix, true);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));

    for (var i = 0; i < index; i += 3){
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }
}