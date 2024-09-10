"use strict";

var gl;

//global variables
var sprout_selected = -1;
var grow_selected = -1;
var bloom_selected = -1;

var theta = 0.0;
var thetaLoc;

var delay = 100;
// var direction = true;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    var vertices = [
        //sprout: 4 vertices
        vec2(-0.05, -1.0),
        vec2(-0.05, -0.7),
        vec2(0.05, -1.0),
        vec2(0.05, -0.7),
        //bud_lower: 4 vertices
        vec2(-0.1, -0.8),
        vec2(-0.1, -0.6),
        vec2(0.1, -0.8),
        vec2(0.1, -0.6),
        //stem: 4 vertices
        vec2(-0.05, -1.0),
        vec2(-0.05, -0.0),
        vec2(0.05, -1.0),
        vec2(0.05, -0.0),
        //bud_tall: 4 vertices
        vec2(-0.1, -0.1),
        vec2(-0.1, 0.1),
        vec2(0.1, -0.1),
        vec2(0.1, 0.1),
        //leaf: 4 vertices
        vec2(0.4, -0.5),
        vec2(0.0, -0.7),
        vec2(-0.4, -0.6),
        vec2(0.0, -0.7),
        //bloom: 16 vertices
        vec2(0.1, 0.0),
        vec2(0.4, -0.4),
        vec2(0.0, -0.1),
        vec2(-0.4, -0.4),
        vec2(-0.1, 0.0),
        vec2(-0.4, 0.4),
        vec2(0.0, 0.1),
        vec2(0.4, 0.4),
        vec2(0.1, 0.1),
        vec2(0.5, 0.0),
        vec2(0.1, -0.1),
        vec2(0.0, -0.5),
        vec2(-0.1, -0.1),
        vec2(-0.5, 0.0),
        vec2(-0.1, 0.1),
        vec2(0.0, 0.5)  
    ];

    // Load the data into the GPU

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation( program, "uTheta" );

    // Initialize event handlers
    // document.getElementById("Direction").onclick = function () {
    //     direction = !direction;
    // };

    document.getElementById("Controls" ).onclick = function(event) {
        switch(event.target.index) {
          case 0:
            sprout_selected = 0;
            grow_selected = -1;
            bloom_selected = -1;
            break;
         case 1:
            sprout_selected = -1;
            grow_selected = 1;
            bloom_selected = -1;
            break;
         case 2:
            sprout_selected = -1;
            grow_selected = -1;
            bloom_selected = 2;
            break;
       }
    };

    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch(key) {
          case '1':
            sprout_selected = 0;
            grow_selected = -1;
            bloom_selected = -1;
            break;
          case '2':
            sprout_selected = -1;
            grow_selected = 1;
            bloom_selected = -1;
            break;
          case '3':
            sprout_selected = -1;
            grow_selected = -1;
            bloom_selected = 2;
            break;
        }
    };
    render();
};

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(thetaLoc, 0);

    if(sprout_selected == 0) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); //sprout: 4 vertices
        gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4); //bud_lower: 4 vertices
    }
    else if(grow_selected == 1) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 8, 4);  //stem: 4 vertices
        gl.drawArrays(gl.TRIANGLE_STRIP, 12, 4); //bud_tall: 4 vertices
        gl.drawArrays(gl.TRIANGLE_STRIP, 16, 4); //leaf: 4 vertices
    }
    else if(bloom_selected == 2) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 8, 4); //stem: 4 vertices
        gl.drawArrays(gl.TRIANGLE_STRIP, 12, 4); //bud_tall: 4 vertices 
        gl.drawArrays(gl.TRIANGLE_STRIP, 16, 4); //leaf: 4 vertices
        
        //rotate the bloom
        theta += 0.1;
        gl.uniform1f(thetaLoc, theta);
        gl.drawArrays(gl.TRIANGLE_FAN, 20, 16); //bloom: 16 vertices
    }

    setTimeout(
        function (){requestAnimationFrame(render);}, delay
    );
}
