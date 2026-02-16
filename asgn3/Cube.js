class Cube{
  constructor(){
    this.type='cube';
    //this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segment = 10;
    this.matrix = new Matrix4();
    this.textureNum=-2;
  }
  // Render this shape
  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;
    //var segment = this.segment;

    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);
    
    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front
    //drawTriangle3D( [0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0] );
    drawTriangle3DUV( [0,0,0,   1,1,0,   1,0,0], [0,0,  1,1,  1,0] );
    drawTriangle3DUV( [0,0,0,   0,1,0,   1,1,0], [0,0,  0,1,  1,1] );

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]); 
    
    //Other sides of cube top, bottom, left, right, back
    // Top
    drawTriangle3DUV( [0,1,0,  1,1,1,  0,1,1], [0,0,  1,1,  0,1] );
    drawTriangle3DUV( [0,1,0,  1,1,0,  1,1,1], [0,0,  1,0,  1,1] );
    // Bottom
    drawTriangle3DUV( [0,0,0,  1,0,1,  1,0,0], [0,0,  1,1,  1,0] );
    drawTriangle3DUV( [0,0,0,  0,0,1,  1,0,1], [0,0,  0,1,  1,1] );
    // Left
    drawTriangle3DUV( [0,0,0,  0,1,1,  0,0,1], [0,0,  1,1,  0,1] );
    drawTriangle3DUV( [0,0,0,  0,1,0,  0,1,1], [0,0,  1,0,  1,1] );
    // Right
    drawTriangle3DUV( [1,0,0,  1,1,1,  1,0,1], [0,0,  1,1,  0,1] );
    drawTriangle3DUV( [1,0,0,  1,1,0,  1,1,1], [0,0,  1,0,  1,1] );
    // Back
    drawTriangle3DUV( [0,0,1,  1,1,1,  1,0,1], [0,0,  1,1,  1,0] );
    drawTriangle3DUV( [0,0,1,  0,1,1,  1,1,1], [0,0,  0,1,  1,1] );

  }

  renderfast() {
    var rgba = this.color;

    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    var frontverts = [];
    var frontuv = [];
    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    // Front
    frontverts = frontverts.concat( [0,0,0,  1,1,0,  1,0,0] );
    frontverts = frontverts.concat( [0,0,0,  0,1,0,  1,1,0] );
    frontuv = frontuv.concat(
    [0,0, 1,1, 1,0,
     0,0, 0,1, 1,1]
  );
    // Back
    frontverts = frontverts.concat([0,0,1,  1,1,1,  1,0,1]);
    frontverts = frontverts.concat([0,0,1,  0,1,1,  1,1,1]);
    frontuv = frontuv.concat(
    [0,0, 1,1, 1,0,
     0,0, 0,1, 1,1]
  );
    drawTriangle3DUV(frontverts, frontuv);
    
    var sideverts = [];
    var sideuv = [];
    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    // Left
    sideverts = sideverts.concat([0,0,0,  0,1,1,  0,0,1]);
    sideverts = sideverts.concat([0,0,0,  0,1,0,  0,1,1]);
    sideuv = sideuv.concat(
    [0,0,1,1,0,1,
     0,0,1,0,1,1]
  );
    // Right
    sideverts = sideverts.concat([1,0,0,  1,1,1,  1,0,1]);
    sideverts = sideverts.concat([1,0,0,  1,1,0,  1,1,1]);
    sideuv = sideuv.concat(
    [0,0,1,1,0,1,
     0,0,1,0,1,1]
  );
    drawTriangle3DUV(sideverts, sideuv);

    var topverts = [];
    var topuv = [];
    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    // Top
    topverts = topverts.concat([0,1,0,  1,1,1,  0,1,1]);
    topverts = topverts.concat([0,1,0,  1,1,0,  1,1,1]);
    topuv = topuv.concat(
    [0,0,1,1,0,1,
     0,0,1,0,1,1]
  );
    // Bottom
    topverts = topverts.concat([0,0,0,  1,0,1,  1,0,0]);
    topverts = topverts.concat([0,0,0,  0,0,1,  1,0,1]);
    topuv = topuv.concat(
    [0,0,1,1,1,0,
     0,0,0,1,1,1]
  );
    drawTriangle3DUV(topverts, topuv);
  }
}