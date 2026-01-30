class Cube{
  constructor(){
    this.type='cube';
    //this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segment = 10;
    this.matrix = new Matrix4();
  }
  // Render this shape
  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;
    //var segment = this.segment;
    
    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front
    drawTriangle3D( [0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0] );
    drawTriangle3D( [0.0,0.0,0.0,  0.0,1.0,0.0,  1.0,1.0,0.0] );

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]); 
    
    //Other sides of cube top, bottom, left, right, back
    // Top
    drawTriangle3D( [0.0,1.0,0.0,  0.0,1.0,1.0,  1.0,1.0,1.0] );
    drawTriangle3D( [0.0,1.0,0.0,  1.0,1.0,1.0,  1.0,1.0,0.0] );
    // Bottom
    drawTriangle3D( [0.0,0.0,0.0,  1.0,0.0,1.0,  1.0,0.0,0.0] );
    drawTriangle3D( [0.0,0.0,0.0,  0.0,0.0,1.0,  1.0,0.0,1.0] );
    // Left
    drawTriangle3D( [0.0,0.0,0.0,  0.0,0.0,1.0,  0.0,1.0,1.0] );
    drawTriangle3D( [0.0,0.0,0.0,  0.0,1.0,0.0,  0.0,1.0,1.0] );
    // Right
    drawTriangle3D( [1.0,0.0,0.0,  1.0,0.0,1.0,  1.0,1.0,1.0] );
    drawTriangle3D( [1.0,0.0,0.0,  1.0,1.0,0.0,  1.0,1.0,1.0] );
    // Back
    drawTriangle3D( [0.0,0.0,1.0,  1.0,0.0,1.0,  1.0,1.0,1.0] );
    drawTriangle3D( [0.0,0.0,1.0,  0.0,1.0,1.0,  1.0,1.0,1.0] );

  }
}