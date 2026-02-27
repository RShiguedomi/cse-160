class Sphere{
  constructor(){
    this.type='sphere';
    //this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segment = 10;
    this.matrix = new Matrix4();
    this.textureNum=-2;
    this.verts32 = new Float32Array([]);
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

    var d = Math.PI/10;
    var dd = Math.PI/100; //change stepsize (ie 100) for visibility

    for (var t=0; t<Math.PI; t+=d) {
        for (var r=0; r<(2*Math.PI); r+=d) {
            var p1 = [sin(t)*cos(r), sin(t)*sin(r), cos(t)];

            var p2 = [sin(t+dd)*cos(r), sin(t+dd)*sin(r), cos(t+dd)];
            var p3 = [sin(t)*cos(r+dd), sin(t)*sin(r+dd), cos(t)];
            var p4 = [sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd)];

            var uv1 = [t/Math.PI, r/(2*Math.PI)];
            var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
            var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
            var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)]; 

            var v = [];
            var uv = [];
            v=v.concat(p1); uv=uv.concat(uv1);
            v=v.concat(p2); uv=uv.concat(uv2);
            v=v.concat(p4); uv=uv.concat(uv4);

            gl.uniform4f(u_FragColor, 1,1,1,1);
            drawTriangle3DUVNormal(v,uv,v);

            v=[]; uv=[];
            v=v.concat(p1); uv=uv.concat(uv1);
            v=v.concat(p4); uv=uv.concat(uv4);
            v=v.concat(p3); uv=uv.concat(uv3);
            gl.uniform4f(u_FragColor, 1,0,0,1);
            drawTriangle3DUVNormal(v,uv,v);
        }
    }
  }

  // Render this shape
  renderNormal() { //includes normals
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
    drawTriangle3DUVNormal( [0,0,0,   1,1,0,   1,0,0], [0,0,  1,1,  1,0], [0,0,-1,  0,0,-1, 0,0,-1] );
    drawTriangle3DUVNormal( [0,0,0,   0,1,0,   1,1,0], [0,0,  0,1,  1,1], [0,0,-1,  0,0,-1, 0,0,-1] );

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]); 
    
    //Other sides of cube top, bottom, left, right, back
    // Top
    drawTriangle3DUVNormal( [0,1,0,  1,1,1,  0,1,1], [0,0,  1,1,  0,1], [0,1,0,  0,1,0,  0,1,0] );
    drawTriangle3DUVNormal( [0,1,0,  1,1,0,  1,1,1], [0,0,  1,0,  1,1], [0,1,0,  0,1,0,  0,1,0] );
    // Bottom
    drawTriangle3DUVNormal( [0,0,0,  1,0,1,  1,0,0], [0,0,  1,1,  1,0], [0,-1,0,  0,-1,0,  0,-1,0] );
    drawTriangle3DUVNormal( [0,0,0,  0,0,1,  1,0,1], [0,0,  0,1,  1,1], [0,-1,0,  0,-1,0,  0,-1,0] );
    // Left
    drawTriangle3DUVNormal( [0,0,0,  0,1,1,  0,0,1], [0,0,  1,1,  0,1], [-1,0,0,  -1,0,0,  -1,0,0] );
    drawTriangle3DUVNormal( [0,0,0,  0,1,0,  0,1,1], [0,0,  1,0,  1,1], [-1,0,0,  -1,0,0,  -1,0,0] );
    // Right
    drawTriangle3DUVNormal( [1,0,0,  1,1,1,  1,0,1], [0,0,  1,1,  0,1], [1,0,0,  1,0,0,  1,0,0] );
    drawTriangle3DUVNormal( [1,0,0,  1,1,0,  1,1,1], [0,0,  1,0,  1,1], [1,0,0,  1,0,0,  1,0,0] );
    // Back
    drawTriangle3DUVNormal( [0,0,1,  1,1,1,  1,0,1], [0,0,  1,1,  1,0], [0,0,1,  0,0,1, 0,0,1] );
    drawTriangle3DUVNormal( [0,0,1,  0,1,1,  1,1,1], [0,0,  0,1,  1,1], [0,0,1,  0,0,1, 0,0,1 ] );

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