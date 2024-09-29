"use strict";

var canvas;
var gl;

var amtOfCubes =1;
var NumVertices = 21;

var points = [];

var colorsChoice = true;
var colors = [];
var colorsInterp=[];
var colorsSolid=[];


var pause = false;

var renderTris = true;

var friends = false;
var hurricane = false;

var axis = 0;
var theta=0;


var mvm;
var mvmLoc; 


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
var vertexColors = [
    [0.13, 0.22, 0.26, 1.0],  // gunmetal
    [1.0, 1.0, 1.0, 1.0],  // white
    [0.86, .73, 0.85, 1.0],  // lilac
    [0.85, .71, .63, 1.0],  // orange
    [0.84, 0.48, .38, 1.0],  // coral
    [.27, 0.2, .31, 1.0],  // purple
    [.32, .23, 0.2, 1.0],  // brown
    [0.0, .3, .6, 1.0]   // blue
];

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    colorCube(renderTris);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsSolid), gl.STATIC_DRAW);


    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    //event listeners for buttons

    document.getElementById("pause").onclick = function () {
        pause = !pause;
    };
    document.getElementById("color").onclick = function () {
        colorsChoice = !colorsChoice;
        if (colorsChoice){
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsSolid), gl.STATIC_DRAW);
        }
        else{
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsInterp), gl.STATIC_DRAW);
        }
    };
    document.getElementById("fill").onclick = function () {

        renderTris = !renderTris;

    };
    document.getElementById( "friends" ).onclick = function () {
        hurricane = false;
        friends= !friends;
    };
    document.getElementById( "hurricane" ).onclick = function () {
        // turn off friends if hurricane is active
        theta=0;
        friends = false;
        hurricane = !hurricane;
    };

    mvmLoc = gl.getUniformLocation( program, "mvm" );


    render();
}

// Quad
function quad(a, b, c, d) {
    var indices=[a,b,c,d];

    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
            colorsInterp.push(vertexColors[a]);
            colorsSolid.push(vertexColors[indices[i]])
    }

}
function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}


// bring the actual rendering into a function so all cubes can be rendered with consideration to the first 3 buttons
function renderCall(){
    if (renderTris) {
        for (let i = 0; i < NumVertices; i += 4) {
            
            gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
            
        }
    } else {
        for (let i = 0; i < NumVertices; i += 4) {
            
            gl.drawArrays(gl.LINE_LOOP, i, 4);
            
        }
    }
}



// RENDER
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    mvm = mat4();

    
    if (pause) {
        theta;
    }
    else {
        theta+=1;
    }

    if (friends){

        // Modify mvm, send it, then call another cube
        mvm = mult(mvm,rotateY(45));
        mvm = mult(mvm,rotateZ(45));
        mvm= mult(mvm,rotateX(theta));
        mvm = mult(mvm,scalem(.3,.3,.3));
        gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );
        renderCall();
        
        
        mvm = mat4();
        mvm = mult(mvm, translate(.4,.6,0));
        mvm = mult(mvm, rotate(theta,vec3(8,2,7)));
        mvm = mult(mvm,scalem(.2,.2,.2));
        gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );
        renderCall();

        
        mvm = mat4();
        mvm = mult(mvm, translate(-.5,.4,0));
        mvm = mult(mvm, rotate(theta,vec3(6,-9,3)));
        mvm = mult(mvm,scalem(.2,.6,.2));
        gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );
        renderCall();

        mvm = mat4();
        mvm = mult(mvm, translate(.5,-.4,0));
        mvm = mult(mvm, rotate(theta,vec3(-1,-7,3)));
        mvm = mult(mvm,scalem(.3,.75,.1));
        gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );
        renderCall();

        mvm = mat4();
        mvm = mult(mvm, translate(-.5,-.5,0));
        mvm = mult(mvm, rotate(theta,vec3(-1,1,3)));
        mvm = mult(mvm,scalem(.1,.8,.1));
        gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );
        renderCall();






    }else if(hurricane){
        mvm = mult(mvm,rotateY(45));
        mvm = mult(mvm,rotateZ(45));
        mvm= mult(mvm,rotateX(theta));
        mvm = mult(mvm,scalem(.3,.3,.3));
        gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );
        renderCall();

        mvm = mat4();
        mvm = mult(mvm, rotateZ(theta*1.2));

        mvm = mult(mvm, translate(.4,.6,0));
        // mvm = mult(mvm, rotate(theta,vec3(8,2,7)));
        mvm = mult(mvm,scalem(.2,.2,.2));
        gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );
        renderCall();

        
        mvm = mat4();
        mvm = mult(mvm, rotateZ(theta * 1.3));

        mvm = mult(mvm, translate(-.5,.4,0));
        // mvm = mult(mvm, rotate(theta,vec3(6,-9,3)));
        mvm = mult(mvm,scalem(.2,.6,.2));
        gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );
        renderCall();

        mvm = mat4();
        mvm = mult(mvm, rotateZ(theta*.7));

        mvm = mult(mvm, translate(.5,-.4,0));
        // mvm = mult(mvm, rotate(theta,vec3(-1,-7,3)));
        mvm = mult(mvm,scalem(.3,.75,.1));
        gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );
        renderCall();

        mvm = mat4();
        mvm = mult(mvm, rotateZ(theta));

        mvm = mult(mvm, translate(-.5,-.5,0));
        // mvm = mult(mvm, rotate(theta,vec3(-1,1,3)));
        mvm = mult(mvm,scalem(.1,.8,.1));
        gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );
        renderCall();




    }
    else{

    mvm = mult(mvm,rotateY(45));
    mvm = mult(mvm,rotateZ(45));
    mvm= mult(mvm,rotateX(theta));
    gl.uniformMatrix4fv( mvmLoc, false, flatten(mvm) );


    renderCall();

    }
    



    requestAnimFrame(render);
}