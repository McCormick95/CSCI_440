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

// Awakening Variables
var awaken_status = false;
var color_one = vec4(0.0, 0.7, 0.3, 1.0);
var color_two = vec4(0.8, 0.2, 0.4, 1.0);

// Power Surge Variables
var power_surge_status = false;
var pulse_speed = 0.01;
var pulse_toggle = 1;
var r_max, g_max, b_max;
var updateDiffuse;

// Seeking Light Variables
var seeking_light_status = false;
var update_light_pos;
var light_speed = 0.05;
var seek_toggle = 1;
var new_light_pos;

// Focused Gaze Variables
var focused_gaze_status = false;
var focused_gaze_speed = 0.02;
var focused_gaze_toggle = 1;

var lightPosition = vec4(0.0, 0.25, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = color_one;
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
    //diffuseProduct = mult(lightDiffuse, materialDiffuse);
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

    // Awakening: button to toggle boolean value to control color change
    document.getElementById("Button0").onclick = function(){
        awaken_status = !awaken_status;
        awaken();
    };
    // Power Surge: button to toggle boolean value to control pulse effect
    document.getElementById("Button1").onclick = function(){
        power_surge_status = !power_surge_status;
        power_surge(); 
    };
    // Seeking Light: button to toggle boolean value to control light movement
    document.getElementById("Button2").onclick = function(){
        seeking_light_status = !seeking_light_status;
        seeking_light();
    };
    // Focused Gaze: button to toggle boolean value to control focused gaze effect
    document.getElementById("Button3").onclick = function(){
        focused_gaze_status = !focused_gaze_status;
        focus_gaze();
    };

    gl.uniform4fv(gl.getUniformLocation(program,"uAmbientProduct"),flatten(ambientProduct));
    updateDiffuseProduct(materialDiffuse);
    gl.uniform4fv(gl.getUniformLocation(program,"uSpecularProduct"),flatten(specularProduct));
    updateLightPosition(lightPosition);
    gl.uniform1f(gl.getUniformLocation(program,"uShininess"),materialShininess);

    render();
}
// Update the diffuse product
function updateDiffuseProduct(defuse) {
    diffuseProduct = mult(lightDiffuse, defuse);
    gl.uniform4fv(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "uDiffuseProduct"), flatten(diffuseProduct));
}
// Update the light position
function updateLightPosition(lightPos) {
    lightPosition = lightPos;
    gl.uniform4fv(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "uLightPosition"), flatten(lightPosition));
}
// Awakening effect
function awaken(){
    if(awaken_status){
        materialDiffuse = color_two;
    }
    else{
        materialDiffuse = color_one;
    }
    updateDiffuseProduct(materialDiffuse);
}
// Power Surge effect
function power_surge(){
    var color_temp = materialDiffuse;
    if (power_surge_status) {
        // Update the color values
        color_temp[0] += pulse_speed * pulse_toggle; 
        color_temp[1] += pulse_speed * pulse_toggle;
        color_temp[2] += pulse_speed * pulse_toggle;

        // Round the color values to 2 decimal places
        color_temp[0] = Math.round(color_temp[0] * 100) / 100;  
        color_temp[1] = Math.round(color_temp[1] * 100) / 100;
        color_temp[2] = Math.round(color_temp[2] * 100) / 100;

        // Control max value for each color
        r_max = Math.min(1.0, color_temp[0]);
        g_max = Math.min(1.0, color_temp[1]);
        b_max = Math.min(1.0, color_temp[2]);

        // Control min value for each color
        color_temp[0] = Math.max(0.0, r_max);
        color_temp[1] = Math.max(0.0, g_max);
        color_temp[2] = Math.max(0.0, b_max);

        // Toggle the pulse direction
        if(color_temp[1] == 1.00 || color_temp[1] == 0.00 || color_temp[2] == 1.00 || color_temp[2] == 0.00 || color_temp[0] == 1.00 || color_temp[0] == 0.00){
            pulse_toggle *= -1;
        }
        
        // Update the color values
        updateDiffuse = vec4(color_temp[0], color_temp[1], color_temp[2], 1.0);
        updateDiffuseProduct(updateDiffuse); 
        
        requestAnimationFrame(power_surge);
    }
    else{
        return;
    }
}
// Seeking Light effect
function seeking_light(){
    var temp_light = lightPosition;

    if(seeking_light_status){
        // Update the light position
        temp_light[0] += light_speed * seek_toggle;

        // Round the light position to 2 decimal places
        temp_light[0] = Math.round(temp_light[0] * 100) / 100;

        // Control max and min values for light position
        if(temp_light[0] == 3.00 || temp_light[0] == -3.00){
            seek_toggle *= -1;
        }

        // Update the light position
        new_light_pos = vec4(temp_light[0], lightPosition[1], lightPosition[2], 0.0);
        updateLightPosition(new_light_pos);
        requestAnimationFrame(seeking_light);
    }
    else{
        return;
    }
}
// Focused Gaze effect
function focus_gaze(){
    if(focused_gaze_status){
        // Update the ytop and bottom values
        ytop += focused_gaze_speed * focused_gaze_toggle;
        bottom -= focused_gaze_speed * focused_gaze_toggle;

        // Round values to 2 decimal places
        ytop = Math.round(ytop * 100) / 100;
        bottom = Math.round(bottom * 100) / 100;

        // Toggle the direction of the focused gaze effect
        if(ytop == 7 || bottom == -7 || ytop == 3 || bottom == -3){
            focused_gaze_toggle *= -1;
        }
        
        requestAnimationFrame(focus_gaze);
    }
    else{
        return;
    }
}

// Define the positions for two spheres
var position_1 = vec3(-1.25, 0, 0);  // Left sphere
var position_2 = vec3(1.25, 0, 0);   // Right sphere

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    phi = dr;
    
    // Render spheres
    render_sphere(position_1);
    render_sphere(position_2);

    requestAnimationFrame(render);
}

// Render a sphere, given a position
function render_sphere(position){
    var sphere_position = position;
    eye = vec3(radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    var viewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    // translate the sphere to the given position
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