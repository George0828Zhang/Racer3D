# Racer3D
## How to add a model
##### Step 1 : create JSON file
A model is composed of several triangles, each of which is represented by 3 vertices. The following is the content of `road_line.json` representing a yellow rectangle sitting on xy plane facing positive z direction, where the camera is sitting. 
```json
{
	"vertexPositions" : [-1.0,-1.0,0.0,1.0,-1.0,0.0,1.0,1.0,0.0,1.0,1.0,0.0,-1.0,1.0,0.0,-1.0,-1.0,0.0],
	"vertexNormals" : [0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0],
	"vertexFrontcolors" : [255,255,0,255,255,0,255,255,0,255,255,0,255,255,0,255,255,0],
	"vertexBackcolors" : [0,255,0,0,255,0,0,255,0,0,255,0,0,255,0,0,255,0]
}
```
Notice that each vertex has 4 attributes, which are `Position`, `Normal`, `Frontcolor` and `Backcolor`.
- Position: The vertex's position reletive to center of the model.
- Normal: The vector representing the vertex's facing. For the sake of simplicity, let's assume all three normals of a triangle are the same. For example, [0.0,0.0,1.0] points directly at the camera.
- Frontcolor: The color of the vertex, when the camera is in the front of the vertex. 
- Backcolor: The color of the vertex, when the camera is in the back of the vertex.

Note that the color of a point in a triangle is interpolated from the three vertices making up said triangle.
##### Step2 : set default values
When a model is loaded into the scene, the program needs information regarding where to put the model. The following code found in `animation.js` is where this information is kept. 
```javascript
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
	}
}
```
Here are a few tips about the scene.
- the camera is sitting at (0, 0, 0)
- +x is towards the right of the camera
- +y is towards the up of the camera
- +z is towards the back of the camera
- the unit of measure of rotation is degree
##### Step 3 : load the model
Finally we load the model into the scene. To do this we need the location of the `.json` file we just created. For this example the file is at `Models/road_line.json`. We then add the following code to the function `webGLStart()`, inside `animation.js`.
```javascript
loadModel("Models/road_line.json");
```
And that's it! The model will now show up in the scene. Next we will explore how to move an object in the scene.
