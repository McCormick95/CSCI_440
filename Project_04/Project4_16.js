"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var torsoId = 0;
var headId  = 1;
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
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.5;

var numNodes = 10;
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

var figures = [
    {
        nodes: [],
        theta: [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0],
        stack: [],
        modelView: mat4(),
        color: vec4(0.0, 0.0, 1.0, 1.0),  // blue for first figure
        position: vec3(0.0, 0.0, 0.0),
        scale: vec3(1.0, 1.0, 1.0)
    },
    {
        nodes: [],
        theta: [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0],
        stack: [],
        modelView: mat4(),
        color: vec4(1.0, 0.0, 0.0, 1.0),  // red for second figure
        position: vec3(5.0, 0.0, 0.0),     // positioned 5 units to the right
        scale: vec3(0.8, 0.8, 0.8)         // scaled to 80%
    }
];

// for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);
for(let i = 0; i < figures.length; i++) {
    for(let j = 0; j < numNodes; j++) {
        figures[i].nodes[j] = createNode(null, null, null, null);
    }
}

var vBuffer;
var modelViewLoc;

var pointsArray = [];

function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}

function initNodes(figureIndex, Id) {
    var m = mat4();
    var figure = figures[figureIndex];

    switch(Id) {

        case torsoId:

        m = rotate(figure.theta[torsoId], vec3(0, 1, 0) );
        figure[torsoId] = createNode( m, torso, null, headId );
        break;

        case headId:
        case head1Id:
        case head2Id:

        m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
        m = mult(m, rotate(figure.theta[head1Id], vec3(1, 0, 0)))
        m = mult(m, rotate(figure.theta[head2Id], vec3(0, 1, 0)));
        m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
        figure[headId] = createNode( m, head, leftUpperArmId, null);
        break;

        case leftUpperArmId:

        m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
        m = mult(m, rotate(figure.theta[leftUpperArmId], vec3(1, 0, 0)));
        figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
        break;

        case rightUpperArmId:

        m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
        m = mult(m, rotate(figure.theta[rightUpperArmId], vec3(1, 0, 0)));
        figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
        break;

        case leftUpperLegId:

        m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
        m = mult(m , rotate(figure.theta[leftUpperLegId], vec3(1, 0, 0)));
        figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
        break;

        case rightUpperLegId:

        m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
        m = mult(m, rotate(figure.theta[rightUpperLegId], vec3(1, 0, 0)));
        figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
        break;

        case leftLowerArmId:

        m = translate(0.0, upperArmHeight, 0.0);
        m = mult(m, rotate(figure.theta[leftLowerArmId], vec3(1, 0, 0)));
        figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
        break;

        case rightLowerArmId:

        m = translate(0.0, upperArmHeight, 0.0);
        m = mult(m, rotate(figure.theta[rightLowerArmId], vec3(1, 0, 0)));
        figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
        break;

        case leftLowerLegId:

        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(figure.theta[leftLowerLegId],vec3(1, 0, 0)));
        figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
        break;

        case rightLowerLegId:

        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(figure.theta[rightLowerLegId], vec3(1, 0, 0)));
        figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
        break;
    }
}

function traverse(figureIndex, Id) {
    var figure = figures[figureIndex];
    
    if(Id == null) return;
    figure.stack.push(figure.modelView);
    figure.modelView = mult(figure.modelView, figure.nodes[Id].transform);
    
    // Set the color for this figure before rendering
    gl.uniform4fv(colorLoc, flatten(figure.color));
    figure.nodes[Id].render();
    
    if(figure.nodes[Id].child != null) traverse(figureIndex, figure.nodes[Id].child);
    figure.modelView = figure.stack.pop();
    if(figure.nodes[Id].sibling != null) traverse(figureIndex, figure.nodes[Id].sibling);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     pointsArray.push(vertices[b]);
     pointsArray.push(vertices[c]);
     pointsArray.push(vertices[d]);
}

function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );
    
    document.getElementById("B_1").onclick = function(){
        figures[0].theta[torsoId ] += 1;
        figures[0].theta[head1Id] += 1;
        figures[0].theta[leftUpperArmId] += 1;
        figures[0].theta[leftLowerArmId] += 1;
        figures[0].theta[rightUpperArmId] += 1;
        figures[0].theta[rightLowerArmId] += 1;
        figures[0].theta[leftUpperLegId] += 1;
        figures[0].theta[leftLowerLegId] += 1;
        figures[0].theta[rightUpperLegId] += 1;
        figures[0].theta[rightLowerLegId] += 1;
        figures[0].theta[head2Id] += 1;

        initNodes(0, torsoId);
        initNodes(0, head1Id);
        initNodes(0, leftUpperArmId);
        initNodes(0, leftLowerArmId);
        initNodes(0, rightUpperArmId);
        initNodes(0, rightLowerArmId);
        initNodes(0, leftUpperLegId);
        initNodes(0, leftLowerLegId);
        initNodes(0, rightUpperLegId);
        initNodes(0, rightLowerLegId);
        initNodes(0, head2Id);
    };

    for(i=0; i<numNodes; i++) initNodes(0, i);

    render();
}

var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    figures[0].modelView = mat4();  // Reset first figure's matrix
    traverse(0, torsoId);          // Draw first figure

    // Draw second figure
    figures[1].modelView = mat4();  // Reset second figure's matrix
    traverse(1, torsoId);          // Draw second figure
    requestAnimationFrame(render);
}
