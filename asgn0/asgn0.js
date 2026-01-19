// DrawTriangle.js (c) 2012 matsuda
let canvas;
let ctx;

function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  // Draw a black rectangle
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(ctx, v, color) {
  const scale = 20;

  const originX = 200;
  const originY = 200;

  const endX = originX + v.elements[0] * scale;
  const endY = originY - v.elements[1] * scale;

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

function clearCanvas() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function handleDrawEvent() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // User input
  let x1 = parseFloat(document.getElementById("xInput1").value);
  let y1 = parseFloat(document.getElementById("yInput1").value);
  let v1 = new Vector3([x1, y1, 0]);

  let x2 = parseFloat(document.getElementById("xInput2").value);
  let y2 = parseFloat(document.getElementById("yInput2").value);
  let v2 = new Vector3([x2, y2, 0]);

  drawVector(ctx, v1, "red");
  drawVector(ctx, v2, "blue");
}

function handleDrawOperationEvent() {
  clearCanvas();
  
  // User input
  let x1 = parseFloat(document.getElementById("xInput1").value);
  let y1 = parseFloat(document.getElementById("yInput1").value);
  let v1 = new Vector3([x1, y1, 0]);

  let x2 = parseFloat(document.getElementById("xInput2").value);
  let y2 = parseFloat(document.getElementById("yInput2").value);
  let v2 = new Vector3([x2, y2, 0]);

  drawVector(ctx, v1, "red");
  drawVector(ctx, v2, "blue");

  let op = document.getElementById("operation").value;
  let s = parseFloat(document.getElementById("scalarInput").value);

  if (op == "add") {
    let v3 = new Vector3(v1.elements);
    v3.add(v2);
    drawVector(ctx, v3, "green");
  }
  else if (op == "sub") {
    let v3 = new Vector3(v1.elements);
    v3.sub(v2);
    drawVector(ctx, v3, "green");
  }
  else if (op == "mul") {
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.mul(s);
    v4.mul(s);
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  }
  else if (op == "div") {
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.div(s);
    v4.div(s);
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  }
  else if (op == "mag") {
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    console.log("Magnitude of v1:", mag1);
    console.log("Magnitude of v2:", mag2);
  }
  else if (op == "norm") {
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.normalize();
    v4.normalize();
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  }
  else if (op == "angle") {
    angleBetween(v1, v2);
  }
  else if (op == "area") {
    areaTriangle(v1, v2);
  }
}

function angleBetween(v1, v2) {
  const dot = Vector3.dot(v1, v2);
  const mag1 = v1.magnitude();
  const mag2 = v2.magnitude();

  if (mag1 == 0 || mag2 == 0) {
    console.log("Angle undefined (zero-length vector)");
    return;
  }

  let cosAlpha = dot / (mag1 * mag2);
  cosAlpha = Math.min(1, Math.max(-1, cosAlpha));

  const angleRad = Math.acos(cosAlpha);
  const angleDeg = (angleRad * 180) / Math.PI;

  console.log("Angle between v1 and v2 ( degrees):", angleDeg);
}

function areaTriangle(v1, v2) {
  const cross = Vector3.cross(v1, v2);
  const areaParallelogram = cross.magnitude();
  const areaTriangle = areaParallelogram / 2;
  console.log("Area of triangle formed by v1 and v2:", areaTriangle);
}