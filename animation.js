// attributes
const maxspeed = 200;
const track_length = 10000;
const maxlshift = -1.7;
const maxrshift = 0.3;
const skyRGBA = [0, 153, 203, 255];


var speed = 0;
var traveled = 0;

var lastTime = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        // moving the road line's z coordinate
        var dS = 0.0001*elapsed*speed;
        traveled += dS;
        move("road_line", "z", dS, -20, 0, true);
        move("plant1", "z", dS, -20, 0, true);
        move("plant2", "z", dS, -20, 0, true);

        // process finish line
        if(traveled > track_length){
        	// todo: game winner
        }



		var HUD_dist = document.getElementById("dist");	
		HUD_dist.innerHTML = Math.floor(traveled*10);
    }
    lastTime = timeNow;
}

// controls
function OnKeyDown(event){
	var key = event.keyCode;
	// K_LEFT = 37; K_RIGHT = 39; K_UP = 38;K_DOWN = 40;
	switch(key){
		case 37:
		move("Car", "x", -0.1*speed/50, maxlshift, maxrshift, false);
		// if left is pressed, shift the car to the left
		break;
		case 38:
		speed = Math.min(speed+2, maxspeed);
		// if up is pressed, increase the speed
		break;
		case 39:		
		move("Car", "x", 0.1*speed/50, maxlshift, maxrshift, false);
		// if right is pressed, shift the car to the right
		break;
		case 40:
		speed = Math.max(speed-5, 0);
		// if down is pressed, reduce the speed
		break;
		default:
		// do nothing
		break;
	}
	HUD_speed = document.getElementById("speed");	
	HUD_speed.innerHTML = speed;
}

// this function runs periodically
function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}


// Here is an example of how to setup a model's default attributes
const all_default = {
	"Car":{
		"translation":[-0.7, -0.5, -3],
		"scale":[1.0, 1.0, 1.0],
		"rotation":[90, 180, 90],
	},
	"road_line":{
		"translation":[-0.04, -0.78, -9],
		"scale":[0.07, 1.0, 2.0],
		"rotation":[90, 180, 90],
	},
	"road_body":{
		"translation":[-0.04, -0.8, -6],
		"scale":[1.5, 1.0, 6.0],
		"rotation":[90, 180, 90],
	},
	"plant1":{
		"translation":[-1.7, -0.7, -9],
		"scale":[0.5, 0.5, 0.5],
		"rotation":[90, 180, 90],
	},
	"plant2":{
		"translation":[1.1, -0.7, -9],
		"scale":[0.5, 0.5, 0.5],
		"rotation":[90, 180, 90],
	},
	"sun":{
		"translation":[-3.5, 3.0, -9],
		"scale":[0.25, 0.25, 1.0],
		"rotation":[0, 0, 0],
	},
}

// this function runs only once when the page load up
function webGLStart() {
	// circle(50, 2.5);
    var canvas = document.getElementById("ICG-canvas");
    initGL(canvas);
    initShaders();

    // set the direction of sunlight
    SetLightDir([0., -1., 2.]);

    //load models into the program
    loadModel("Models/Car.json", "Car");
    loadModel("Models/road_body.json", "road_body");
    loadModel("Models/road_line.json", "road_line");
    loadModel("Models/Plant.json", "plant1");
    loadModel("Models/Plant.json", "plant2");
    loadModel("Models/Sun.json", "sun");


    // some other initializations
    // gl.clearColor(0.0, 0.2, 0.2, 1.0);
    gl.clearColor(...skyRGBA.map(function(e){return e/255;}));
    gl.enable(gl.DEPTH_TEST);
  	document.addEventListener('keydown', OnKeyDown);
    reset();
    tick();
}












///////////////////////////////////We don't need to worry about the codes below/////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

// utility functions
function move(name, axis, amount, lbound, ubound, wrapback){
	axis = {0:0, 1:1, 2:2, "x":0, "y":1, "z":2}[axis]
	
    var updt = all_trans[name][axis] + amount
    all_trans[name][axis] = Math.max(lbound, Math.min(updt, ubound));
    if(wrapback &&  (all_trans[name][axis] == ubound || all_trans[name][axis] == lbound)){
		all_trans[name][axis] = all_default[name]['translation'][axis];
	}
}


var gl;
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
    if(!gl.getExtension('OES_standard_derivatives')) {
        throw 'extension not support';
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

var shaderProgram;

function initShaders() {
    var vertexShader = getShader(gl, "VertexShader");
    var fragmentShader = getShader(gl, "FragmentShader");

    shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.vertexFrontColorAttribute = gl.getAttribLocation(shaderProgram, "aFrontColor");
    gl.enableVertexAttribArray(shaderProgram.vertexFrontColorAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.invMatrixUniform = gl.getUniformLocation(shaderProgram, "invMatrix");

    shaderProgram.ambReflectUniform = gl.getUniformLocation(shaderProgram, "Ka");
    shaderProgram.diffReflectUniform = gl.getUniformLocation(shaderProgram, "Kd");
    shaderProgram.specReflectUniform = gl.getUniformLocation(shaderProgram, "Ks");
    shaderProgram.specDeviateUniform = gl.getUniformLocation(shaderProgram, "n");
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();
var invMatrix = mat4.create();

function PushMatrices() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function PopMatrices() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}


function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.invMatrixUniform, false, invMatrix);
}

function setReflectUniforms(params) {
    gl.uniform1f(shaderProgram.ambReflectUniform, params[0]);
    gl.uniform1f(shaderProgram.diffReflectUniform, params[1]);
    gl.uniform1f(shaderProgram.specReflectUniform, params[2]);
    gl.uniform1f(shaderProgram.specDeviateUniform, params[3]);
}

function SetLightDir(pos){
    var lightsource = gl.getUniformLocation(shaderProgram, "LightRay");
    gl.uniform3fv(lightsource, pos);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

var VertexPositionBuffer = [];
var VertexNormalBuffer = [];
var VertexFrontColorBuffer = [];
var VertexBackColorBuffer = [];

function handleLoadedModel(desData) {
    var desVertexPositionBuffer;
    var desVertexNormalBuffer;
    var desVertexFrontColorBuffer;
    var desVertexBackColorBuffer;

    desVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, desVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(desData.vertexNormals), gl.STATIC_DRAW);
    desVertexNormalBuffer.itemSize = 3;
    desVertexNormalBuffer.numItems = desData.vertexNormals.length / 3;

    desVertexFrontColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, desVertexFrontColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(desData.vertexFrontcolors), gl.STATIC_DRAW);
    desVertexFrontColorBuffer.itemSize = 3;
    desVertexFrontColorBuffer.numItems = desData.vertexFrontcolors.length / 3;
     
    desVertexBackColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, desVertexBackColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(desData.vertexBackcolors), gl.STATIC_DRAW);
    desVertexBackColorBuffer.itemSize = 3;
    desVertexBackColorBuffer.numItems = desData.vertexBackcolors.length / 3;

    desVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, desVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(desData.vertexPositions), gl.STATIC_DRAW);
    desVertexPositionBuffer.itemSize = 3;
    desVertexPositionBuffer.numItems = desData.vertexPositions.length / 3;

    VertexPositionBuffer.push(desVertexPositionBuffer);
    VertexNormalBuffer.push(desVertexNormalBuffer);
    VertexFrontColorBuffer.push(desVertexFrontColorBuffer);
    VertexBackColorBuffer.push(desVertexBackColorBuffer);    
}

var loaded = 0;
function loadModel(model, name) {    
    var request = new XMLHttpRequest();
    request.open("GET", model);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            handleLoadedModel(JSON.parse(request.responseText));
            
            // var sub = model.split(/[.\/]/);
            // var name = sub[sub.length-2];
            all_name[loaded++] = name;
            all_reflect_params[name] = [0.3, 0.5, 0.5, 80.0];
            all_trans[name] = all_default[name]["translation"].slice();
	        all_scale[name] = all_default[name]["scale"].slice();
	        all_rot[name] = all_default[name]["rotation"].slice();

	        if(name=="road_body"){
	        	all_reflect_params[name] = [0.1, 0.1, 0.0, 1.0];
	        }
        }
    }
    request.send();   
}
var all_name = [];
var all_reflect_params = {};
var all_trans = {};
var all_scale = {};
var all_rot = {};


function reset(){
    spinAngle = 180;
    for (var name in all_name){  	
		all_trans[name] = all_default[name]["translation"].slice();
		all_scale[name] = all_default[name]["scale"].slice();
		all_rot[name] = all_default[name]["rotation"].slice();
    }
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 150.0, pMatrix);
    mat4.identity(mvMatrix);

    for(var i = 0; i < VertexPositionBuffer.length; i++){
        if (VertexPositionBuffer[i] == null || VertexNormalBuffer[i] == null || VertexFrontColorBuffer[i] == null || VertexBackColorBuffer[i] == null) {
           return;
        }
        

        var name, scale, trans, rot, shear;

        name = all_name[i];
        scale = all_scale[name];
        trans = all_trans[name];
        rot = all_rot[name];
    
        PushMatrices();

        // mat4.identity(mvMatrix);
        
        /*order: scale,rotate,shear -> translation. since matrices are multiplied to the right of mvMatrix.*/
        mat4.translate(mvMatrix, trans);
        mat4.scale(mvMatrix, scale);
        mat4.rotate(mvMatrix, degToRad(rot[0]), [1, 0, 0]);
        mat4.rotate(mvMatrix, degToRad(rot[1]), [0, 1, 0]);
        mat4.rotate(mvMatrix, degToRad(rot[2]), [0, 0, 1]);

        mat4.inverse(mvMatrix, invMatrix);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer[i]);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, VertexPositionBuffer[i].itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, VertexNormalBuffer[i]);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, VertexNormalBuffer[i].itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, VertexFrontColorBuffer[i]);
        gl.vertexAttribPointer(shaderProgram.vertexFrontColorAttribute, VertexFrontColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0);

        setMatrixUniforms();
        setReflectUniforms(all_reflect_params[name]);
        gl.drawArrays(gl.TRIANGLES, 0, VertexPositionBuffer[i].numItems);

        PopMatrices();
    }
}

function circle(tri, r){
	var points = [];
	var normals = [];
	var frontc = [];
	var backc = [];
	// var points = [];
	var center = [0, 0, -5]; 

	for (var i = 0; i <= tri; i++){
		points.push(...center);
		points.push(r*Math.cos(2*Math.PI*i/tri));
	    points.push(r*Math.sin(2*Math.PI*i/tri));
	    points.push(-5.0);
	    points.push(r*Math.cos(2*Math.PI*(i+1)/tri));
	    points.push(r*Math.sin(2*Math.PI*(i+1)/tri));	        
	    points.push(-5.0);

	    normals.push(0.0, 0.0, 1.0);
	    normals.push(0.0, 0.0, 1.0);
	    normals.push(0.0, 0.0, 1.0);

	    frontc.push(255, 255, 0);
	    frontc.push(255, 255, 0);
	    frontc.push(255, 255, 0);

	    backc.push(255, 255, 0);
	    backc.push(255, 255, 0);
	    backc.push(255, 255, 0);

	}

	console.log(points);
	console.log(normals);
	console.log(frontc);
	console.log(backc);
}