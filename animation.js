// attributes
const car_name = "Car_road";
const maxspeed = 200;
const maxlshift = -1.7;
const maxrshift = 0.3;


var speed = 0;

var lastTime = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        // speed decay:
        speed = Math.max(speed - Math.floor(elapsed/50), 0);
    }
    lastTime = timeNow;
}

// controls
function OnKeyDown(event){
	var key = event.keyCode;
	// K_LEFT = 37; K_RIGHT = 39; K_UP = 38;K_DOWN = 40;
	switch(key){
		case 37:
		all_trans[car_name][0] = Math.max(all_trans[car_name][0] - 0.1*speed/50, maxlshift);
		break;
		case 38:
		speed = Math.min(speed+2, maxspeed);		
		break;
		case 39:
		all_trans[car_name][0] = Math.min(all_trans[car_name][0] + 0.1*speed/50, maxrshift);
		break;
		case 40:
		speed = Math.max(speed-5, 0);
		break;
		default:
		// do nothing
		break;
	}
	HUD_speed = document.getElementById("speed");	
	HUD_speed.innerHTML = speed;
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////// 

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
function loadModel(model) {    
    var request = new XMLHttpRequest();
    request.open("GET", model);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            handleLoadedModel(JSON.parse(request.responseText));
            
            var sub = model.split(/[.\/]/);
            var name = sub[sub.length-2];
            all_name[loaded++] = name;
            all_reflect_params[name] = [0.3, 0.5, 0.5, 80.0];            
            all_trans[name] = all_default["Car_road"];
            all_scale[name] = [1.0, 1.0, 1.0];
            all_rot[name] = [90, 180, 90];

            // if(sub[sub.length-2]=="Easter"){
            //     all_reflect_params[loaded-1] = [0.2, 0.5, 0.2, 64.0];
            // }else if(sub[sub.length-2]=="Car_road"){
            //     all_reflect_params[loaded-1] = [0.3, 0.2, 0.8, 50.0];
            // }else{
            //     all_reflect_params[loaded-1] = [0.2, 0.3, 0.7, 50.0];
            // }
        }
    }
    request.send();   
}

var all_default = {"Car_road":[-0.7, -0.5, -3],}
var all_name = [];
var all_reflect_params = {};
var all_trans = {};
var all_scale = {};
var all_rot = {};


function reset(){
    spinAngle = 180;
    for (var name in all_name){  	
        all_trans[name] = [0, 0, -5];
        all_scale[name] = [1.0, 1.0, 1.0];
        all_rot[name] = [90, 180, 90];
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

// function tick() {
//     requestAnimFrame(tick);
//     drawScene();
//     animate();
// }


function webGLStart() {
    var canvas = document.getElementById("ICG-canvas");
    initGL(canvas);
    initShaders();
    SetLightDir([0., -1., 2.]);
    loadModel("Models/Car_road.json"); 

    gl.clearColor(0.0, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

   //  output = document.getElementById("output");
  	// document.onkeydown = updateKeys;
  	document.addEventListener('keydown', OnKeyDown);

    reset();
    tick();
}