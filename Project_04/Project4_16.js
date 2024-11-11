"use strict";
var canvas;
var gl;
var program;

var lightPosition = vec4(-1.0, -2.0, 3.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var uProjectionMatrix;
var uModelViewMatrix;
var instanceMatrix;
var modelViewMatrixLoc;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

// scene status variables
var scene_1 = false;
var scene_2 = false;
var scene_3 = false;
var scene_4 = false;

var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

var torsoHeight = 5.0;
var torsoWidth = 0.7;
var upperArmHeight = 2.0;
var lowerArmHeight = 1.5;
var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;
var upperLegWidth = 0.5;
var lowerLegWidth = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.5;

var numNodes = 10;
var numAngles = 11;
var angle = 0;

var theta1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var theta2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var stack = [];

var figure1 = [];
var figure2 = [];

for (var i = 0; i < numNodes; i++){
    figure1[i] = createNode(null, null, null, null);
    figure2[i] = createNode(null, null, null, null);
} 
// position for figure 1 and figure 2
var figure2PositionOffset = vec3(4.0, -1.0, 0.0);
var figure1PositionOffset = vec3(-4.0, 0.0, 0.0);
var figure2Scale = 0.8;

var vBuffer;
var modelViewLoc;

var pointsArray = [];
var normalsArray = []; 
// variable for scene_4
var game_over = 0;
var m_d = mat4();
var figure2Scale_new = 0.8;

function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}

function initNodes(Id, figureArray, thetaArray, positionOffset = vec3(0.0, 0.0, 0.0)) {
    var m = mat4();

    var scaleFactor;
    if (figureArray === figure2) {
        scaleFactor = figure2Scale;  
    } else {
        scaleFactor = 1.0;  
    }

    switch (Id) {
        case torsoId:
            m = translate(positionOffset[0], positionOffset[1], positionOffset[2]);  
            m = mult(m, rotate(thetaArray[torsoId], vec3(0, 1, 0)));
            m = mult(m, scale(scaleFactor, scaleFactor, scaleFactor));
            figureArray[torsoId] = createNode(m, torso, null, headId);
            break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(thetaArray[head1Id], vec3(1, 0, 0)));
            m = mult(m, rotate(thetaArray[head2Id], vec3(0, 1, 0)));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figureArray[headId] = createNode(m, head, leftUpperArmId, null);
            break;

        case leftUpperArmId:
            m = translate(-(torsoWidth + upperArmWidth), 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(thetaArray[leftUpperArmId], vec3(1, 0, 0)));
            figureArray[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId);
            break;

        case rightUpperArmId:
            m = translate(torsoWidth + upperArmWidth, 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(thetaArray[rightUpperArmId], vec3(1, 0, 0)));
            figureArray[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId);
            break;

        case leftUpperLegId:
            m = translate(-(torsoWidth + upperLegWidth), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(thetaArray[leftUpperLegId], vec3(1, 0, 0)));
            figureArray[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId);
            break;

        case rightUpperLegId:
            m = translate(torsoWidth + upperLegWidth, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(thetaArray[rightUpperLegId], vec3(1, 0, 0)));
            figureArray[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId);
            break;

        case leftLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(thetaArray[leftLowerArmId], vec3(1, 0, 0)));
            figureArray[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
            break;

        case rightLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(thetaArray[rightLowerArmId], vec3(1, 0, 0)));
            figureArray[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
            break;

        case leftLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(thetaArray[leftLowerLegId], vec3(1, 0, 0)));
            figureArray[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
            break;

        case rightLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(thetaArray[rightLowerLegId], vec3(1, 0, 0)));
            figureArray[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
            break;
    }
}

function traverse(Id, figureArray) {
    if (Id == null) return;
    stack.push(uModelViewMatrix);
    uModelViewMatrix = mult(uModelViewMatrix, figureArray[Id].transform);
    figureArray[Id].render();
    if (figureArray[Id].child != null) traverse(figureArray[Id].child, figureArray);  
    uModelViewMatrix = stack.pop();
    if (figureArray[Id].sibling != null) traverse(figureArray[Id].sibling, figureArray);  
}

function torso() {
    instanceMatrix = mult(uModelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {
    instanceMatrix = mult(uModelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperArm() {
    instanceMatrix = mult(uModelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerArm() {
    instanceMatrix = mult(uModelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {
    instanceMatrix = mult(uModelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {
    instanceMatrix = mult(uModelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {
    instanceMatrix = mult(uModelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {
    instanceMatrix = mult(uModelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {
    instanceMatrix = mult(uModelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {
    instanceMatrix = mult(uModelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}
// added code to update the lighting for both figures
function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
}

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

// update lighting and material properties function
function updateLighting(forFigure2 = false) {
    var figure2MaterialDiffuse = vec4(1.0, 0.0, 1.0, 1.0); 
    
    var currentMaterialDiffuse;
    if (forFigure2) {
        currentMaterialDiffuse = figure2MaterialDiffuse;
    } else {
        currentMaterialDiffuse = materialDiffuse;
    }
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, currentMaterialDiffuse); 
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.6, 0.7, 0.7, 1.0);
    
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    instanceMatrix = mat4();

    uProjectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 10.0);
    uModelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, flatten(uModelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(uProjectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");

    cube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // get status for button 1, 2, 3, 4 and reset button
    document.getElementById("B_1").onclick = function(){
        scene_1 = !scene_1;
    };
    document.getElementById("B_2").onclick = function(){
        scene_2 = !scene_2;
    };
    document.getElementById("B_3").onclick = function(){
        scene_3 = !scene_3;
    };
    document.getElementById("B_4").onclick = function(){
        scene_4 = !scene_4;
    };
    document.getElementById("B_R").onclick = function(){
        //reset all scene status and set back to initial state
        scene_1 = false;
        scene_2 = false;
        scene_3 = false;
        scene_4 = false;
        
        // remove game over message and reset scale
        game_over = 0;
        figure2Scale_new = 0.8;
        var gameOverMsg = document.getElementById("game-over-message");
        gameOverMsg.style.display = "block";
        gameOverMsg.innerHTML = "";
        
        setInitialState();
    };

    for(var i = 0; i < numNodes; i++) {
        initNodes(i, figure1, theta1, figure1PositionOffset);
        initNodes(i, figure2, theta2, figure2PositionOffset);
    }
    
    setInitialState();

    render();
}

var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

    updateLighting(false); 
    traverse(torsoId, figure1);

    updateLighting(true);
    traverse(torsoId, figure2);
    
    stateOne();    
    stateTwo();
    stateThree();
    stateFour();
    
    requestAnimationFrame(render);
}

// sets initial state for both figures and resets the game
var setInitialState = function() {
    theta1[torsoId] = 180;
    theta1[head1Id] = 0;
    theta1[leftUpperArmId] = 180;
    theta1[leftLowerArmId] = 0;
    theta1[rightUpperArmId] = 180;
    theta1[rightLowerArmId] = 0;
    theta1[leftUpperLegId] = 180;
    theta1[leftLowerLegId] = 0;
    theta1[rightUpperLegId] = 180;
    theta1[rightLowerLegId] = 0;
    theta1[head2Id] = 0;

    theta2[torsoId] = 180;
    theta2[head1Id] = 0;
    theta2[leftUpperArmId] = 180;
    theta2[leftLowerArmId] = 0;
    theta2[rightUpperArmId] = 180;
    theta2[rightLowerArmId] = 0;
    theta2[leftUpperLegId] = 180;
    theta2[leftLowerLegId] = 0;
    theta2[rightUpperLegId] = 180;
    theta2[rightLowerLegId] = 0;
    theta2[head2Id] = 0;
    
    for(var i = 0; i < numNodes; i++) {
        initNodes(i, figure1, theta1, figure1PositionOffset);
        initNodes(i, figure2, theta2, figure2PositionOffset);
    }
}

// scene_1 - Turn left
var state_1_toggle_f1 = 1;
var state_1_toggle_f2 = 1;
var stateOne = function() {
    if(scene_1 == true){
        theta1[torsoId] += -1 * state_1_toggle_f1;
        
        if(theta1[torsoId] <= 90 || theta1[torsoId] >= 180){
            state_1_toggle_f1 *= -1;
        }

        theta2[torsoId] += -.75 * state_1_toggle_f2;
        
        if(theta2[torsoId] <= 90 || theta2[torsoId] >= 180){
            state_1_toggle_f2 *= -1;
        } 
    }
    for(var i = 0; i < numNodes; i++) {
        initNodes(i, figure1, theta1, figure1PositionOffset);
        initNodes(i, figure2, theta2, figure2PositionOffset);
    }
}

// scene_2 - Turn raise right hand
var state_2_toggle_f1 = 1;
var state_2_toggle_f2 = 1;
var stateTwo = function() {

    if(scene_2 == true){
        theta1[rightUpperArmId] += -0.75 * state_2_toggle_f1;
        theta1[rightLowerArmId] += -1 * state_2_toggle_f1;
        
        if(theta1[rightUpperArmId] <= 90 || theta1[rightUpperArmId] >= 180){
            state_2_toggle_f1 *= -1;
        }


        theta2[rightUpperArmId] += -1 * state_2_toggle_f2;
        theta2[rightLowerArmId] += -0.5 * state_2_toggle_f2;

        if(theta2[rightUpperArmId] <= 90 || theta2[rightUpperArmId] >= 180){
            state_2_toggle_f2 *= -1;
        } 
    }

    for(var i = 0; i < numNodes; i++) {
        initNodes(i, figure1, theta1, figure1PositionOffset);
        initNodes(i, figure2, theta2, figure2PositionOffset);
    }
}

// scene_3 - Raise left hand and right leg
var state_3_toggle_f1 = 1;
var state_3_toggle_f2 = 1;
var stateThree = function() {

    if(scene_3 == true){
        theta1[leftUpperArmId] += -1 * state_3_toggle_f1;
        theta1[leftLowerArmId] += -1 * state_3_toggle_f1;
        theta1[rightUpperLegId] += -1 * state_3_toggle_f1;
        theta1[rightLowerLegId] = 90;
        
        if(theta1[rightUpperLegId] <= 90 || theta1[rightUpperLegId] >= 180 || theta1[leftUpperArmId] <= 90 || theta1[leftUpperArmId] >= 180){
            state_3_toggle_f1 *= -1;
        }

        theta2[leftUpperArmId] += -1 * state_3_toggle_f2;
        theta2[leftLowerArmId] += -1 * state_3_toggle_f2;
        theta2[rightUpperLegId] += -1 * state_3_toggle_f2;
        theta2[rightLowerLegId] = 90;
        
        if(theta2[rightUpperLegId] <= 90 || theta2[rightUpperLegId] >= 180 || theta2[leftUpperArmId] <= 90 || theta2[leftUpperArmId] >= 180){
            state_3_toggle_f2 *= -1;
        } 
    }

    for(var i = 0; i < numNodes; i++) {
        initNodes(i, figure1, theta1, figure1PositionOffset);
        initNodes(i, figure2, theta2, figure2PositionOffset);
    }
}

// scene_4 - Rotate head - figure 2 loses and disappears
//        figure 2 disappears
var state_4_toggle_f = 1;
var stateFour = function() {
    if(scene_4 == true){
    
        theta2[head2Id] += -1 * state_4_toggle_f;

        if(theta2[head2Id] <= -45 || theta2[head2Id] >= 45){
            state_4_toggle_f *= -1;
            game_over += 1;
        }

        if(game_over >= 3) {
            if(figure2Scale_new >= 0.001) {
                figure2Scale_new -= 0.01;
            }
            
            for(var i = 0; i < numNodes; i++) {
                if(i === torsoId) {
                    var m = mat4();
                    m = translate(figure2PositionOffset[0], figure2PositionOffset[1], figure2PositionOffset[2]);
                    m = mult(m, rotate(theta2[torsoId], vec3(0, 1, 0)));
                    m = mult(m, scale(figure2Scale_new, figure2Scale_new, figure2Scale_new));
                    figure2[torsoId] = createNode(m, torso, null, headId);
                } else {
                    initNodes(i, figure2, theta2, figure2PositionOffset);
                }
            }
        } else {
            for(var i = 0; i < numNodes; i++) {
                initNodes(i, figure2, theta2, figure2PositionOffset);
            }
        }

        for(var i = 0; i < numNodes; i++) {
            initNodes(i, figure1, theta1, figure1PositionOffset);
        }
        var gameOverMsg = document.getElementById("game-over-message");
        gameOverMsg.style.display = "block";
        gameOverMsg.innerHTML = "Game Over - Figure 1 Wins!";
    }
}
